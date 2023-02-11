import { contentImportProfile, IContentImport } from '@remixproject/plugin-api';
import { ContentImport } from '@remixproject/plugin-api';
import { MethodApi } from '@remixproject/plugin-utils';
import { CommandPlugin } from './command';
import { RemixURLResolver } from '@remix-project/remix-url-resolver';

export class ContentImportPlugin extends CommandPlugin
  implements MethodApi<IContentImport> {
  urlResolver: RemixURLResolver;
  constructor() {
    super(contentImportProfile);
    this.urlResolver = new RemixURLResolver();
  }

  async resolve(path: string): Promise<ContentImport> {
    let resolved: any;
    try {
      resolved = await this.urlResolver.resolve(path);
      const { content, cleanUrl, type } = resolved;
      return { content, cleanUrl, type, url: path };
    } catch (e) {
      throw Error(e.message);
    }
  }
  // TODO: implement this method
  async resolveAndSave(url: string, targetPath: string): Promise<string> {
    return '';
  }
}
