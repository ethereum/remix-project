import { dirname, isAbsolute, join } from 'path';

/**
 * A file system interface that matches the node fs module.
 */
export interface FileSystem {
  /** Checks if the file exists */
  existsSync: (path: string) => boolean;
  /** Creates a directory structure */
  mkdir: (
    dir: string,
    opts?: {
      /** Create parent directories as needed */
      recursive: boolean;
    },
  ) => Promise<void>;
  /** Writes a file */
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  /** Reads a file */
  readFile: (path: string, encoding?: 'utf-8') => Promise<Uint8Array | string>;
  /** Renames a file */
  rename: (oldPath: string, newPath: string) => Promise<void>;
  /** Reads a directory */
  readdir: (
    path: string,
    options?: {
      /** Traverse child directories recursively */
      recursive: boolean;
    },
  ) => Promise<string[]>;
}

/**
 * A file manager that writes file to a specific directory but reads globally.
 */
export class FileManager {
  #fs: FileSystem;
  #dataDir: string;

  constructor(fs: FileSystem, dataDir: string) {
    this.#fs = fs;
    this.#dataDir = dataDir;
  }

  /**
   * Returns the data directory
   */
  getDataDir() {
    return this.#dataDir;
  }

  /**
   * Saves a file to the data directory.
   * @param name - File to save
   * @param stream - File contents
   */
  public async writeFile(name: string, stream: ReadableStream<Uint8Array>): Promise<void> {
    if (isAbsolute(name)) {
      throw new Error("can't write absolute path");
    }

    const path = this.#getPath(name);
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      chunks.push(value);
    }

    const file = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      file.set(chunk, offset);
      offset += chunk.length;
    }

    await this.#fs.mkdir(dirname(path), { recursive: true });
    await this.#fs.writeFile(this.#getPath(path), file);
  }

  /**
   * Reads a file from the filesystem and returns a buffer
   * Saves a file to the data directory.
   * @param oldName - File to save
   * @param newName - File contents
   */
  async moveFile(oldName: string, newName: string) {
    if (isAbsolute(oldName) || isAbsolute(newName)) {
      throw new Error("can't move absolute path");
    }

    const oldPath = this.#getPath(oldName);
    const newPath = this.#getPath(newName);

    await this.#fs.mkdir(dirname(newPath), { recursive: true });
    await this.#fs.rename(oldPath, newPath);
  }

  /**
   * Reads a file from the disk and returns a buffer
   * @param name - File to read
   */
  public async readFile(name: string): Promise<Uint8Array>;
  /**
   * Reads a file from the filesystem as a string
   * @param name - File to read
   * @param encoding - Encoding to use
   */
  public async readFile(name: string, encoding: 'utf-8'): Promise<string>;
  /**
   * Reads a file from the filesystem
   * @param name - File to read
   * @param encoding - Encoding to use
   */
  public async readFile(name: string, encoding?: 'utf-8'): Promise<string | Uint8Array> {
    const path = this.#getPath(name);
    const data = await this.#fs.readFile(path, encoding);

    if (!encoding) {
      return typeof data === 'string'
        ? new TextEncoder().encode(data) // this branch shouldn't be hit, but just in case
        : new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }

    return data;
  }

  /**
   * Checks if a file exists and is accessible
   * @param name - File to check
   */
  public hasFileSync(name: string): boolean {
    return this.#fs.existsSync(this.#getPath(name));
  }

  #getPath(name: string) {
    return isAbsolute(name) ? name : join(this.#dataDir, name);
  }

  /**
   * Reads a file from the filesystem
   * @param dir - File to read
   * @param options - Readdir options
   */
  public async readdir(
    dir: string,
    options?: {
      /**
       * Traverse child directories recursively
       */
      recursive: boolean;
    },
  ) {
    const dirPath = this.#getPath(dir);
    return await this.#fs.readdir(dirPath, options);
  }
}