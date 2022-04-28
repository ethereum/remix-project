export const types = `
declare module 'dist/packages/api/lib/compiler/type/input' {
	export interface CompilationInput {
	    /** Source code language */
	    language: 'Solidity' | 'Vyper' | 'lll' | 'assembly' | 'yul';
	    sources: SourcesInput;
	    settings?: CompilerSettings;
	    outputSelection?: CompilerOutputSelection;
	}
	export interface CondensedCompilationInput {
	    language: 'Solidity' | 'Vyper' | 'lll' | 'assembly' | 'yul';
	    optimize: boolean;
	    /** e.g: 0.6.8+commit.0bbfe453 */
	    version: string;
	    evmVersion?: 'istanbul' | 'petersburg' | 'constantinople' | 'byzantium' | 'spuriousDragon' | 'tangerineWhistle' | 'homestead';
	}
	export interface SourceInputUrls {
	    /** Hash of the source file. It is used to verify the retrieved content imported via URLs */
	    keccak256?: string;
	    /**
	     * URL(s) to the source file.
	     * URL(s) should be imported in this order and the result checked against the
	     * keccak256 hash (if available). If the hash doesn't match or none of the
	     * URL(s) result in success, an error should be raised.
	     */
	    urls: string[];
	}
	export interface SourceInputContent {
	    /** Hash of the source file. */
	    keccak256?: string;
	    /** Literal contents of the source file */
	    content: string;
	}
	export interface SourcesInput {
	    [contractName: string]: SourceInputContent | SourceInputUrls;
	}
	export interface CompilerSettings {
	    /** Sorted list of remappings */
	    remappings?: string[];
	    /** Optimizer settings */
	    optimizer?: Partial<CompilerOptimizer>;
	    /** Version of the EVM to compile for. Affects type checking and code generation */
	    evmVersion: 'homestead' | 'tangerineWhistle' | 'spuriousDragon' | 'byzantium' | 'constantinople';
	    /** Metadata settings */
	    metadata?: CompilerMetadata;
	    /** Addresses of the libraries. If not all libraries are given here, it can result in unlinked objects whose output data is different. */
	    libraries: CompilerLibraries;
	}
	export interface CompilerOptimizer {
	    /** disabled by default */
	    enable: boolean;
	    /**
	     * Optimize for how many times you intend to run the code.
	     * Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
	     */
	    runs: number;
	}
	export interface CompilerMetadata {
	    /** Use only literal content and not URLs (false by default) */
	    useLiteralContent: boolean;
	}
	/**
	 * The top level key is the the name of the source file where the library is used.
	 * If remappings are used, this source file should match the global path after remappings were applied.
	 * If this key is an empty string, that refers to a global level.
	 */
	export interface CompilerLibraries {
	    [contractName: string]: {
	        [libName: string]: string;
	    };
	}
	export type OutputType = 'abi' | 'ast' | 'devdoc' | 'userdoc' | 'metadata' | 'ir' | 'evm.assembly' | 'evm.legacyAssembly' | 'evm.bytecode.object' | 'evm.bytecode.opcodes' | 'evm.bytecode.sourceMap' | 'evm.bytecode.linkReferences' | 'evm.deployedBytecode' | 'evm.methodIdentifiers' | 'evm.gasEstimates' | 'ewasm.wast' | 'ewasm.wasm';
	/**
	 * The following can be used to select desired outputs.
	 * If this field is omitted, then the compiler loads and does type checking, but will not generate any outputs apart from errors.
	 * The first level key is the file name and the second is the contract name, where empty contract name refers to the file itself,
	 * while the star refers to all of the contracts.
	 * Note that using a using evm, evm.bytecode, ewasm, etc. will select every
	 * target part of that output. Additionally, * can be used as a wildcard to request everything.
	 */
	export interface CompilerOutputSelection {
	    [file: string]: {
	        [contract: string]: OutputType[];
	    };
	}

}
declare module 'dist/packages/api/lib/compiler/type/output' {
	export interface CompilationFileSources {
	    [fileName: string]: {
	        keccak256?: string;
	        content: string;
	        urls?: string[];
	    };
	}
	export interface SourceWithTarget {
	    sources?: CompilationFileSources;
	    target?: string | null | undefined;
	}
	export interface CompilationResult {
	    /** not present if no errors/warnings were encountered */
	    errors?: CompilationError[];
	    /** This contains the file-level outputs. In can be limited/filtered by the outputSelection settings */
	    sources: {
	        [contractName: string]: CompilationSource;
	    };
	    /** This contains the contract-level outputs. It can be limited/filtered by the outputSelection settings */
	    contracts: {
	        /** If the language used has no contract names, this field should equal to an empty string. */
	        [fileName: string]: {
	            [contract: string]: CompiledContract;
	        };
	    };
	}
	export interface lastCompilationResult {
	    data: CompilationResult | null;
	    source: SourceWithTarget | null | undefined;
	}
	export interface CompilationError {
	    /** Location within the source file */
	    sourceLocation?: {
	        file: string;
	        start: number;
	        end: number;
	    };
	    /** Error type */
	    type: CompilationErrorType;
	    /** Component where the error originated, such as "general", "ewasm", etc. */
	    component: 'general' | 'ewasm' | string;
	    severity: 'error' | 'warning';
	    message: string;
	    /** the message formatted with source location */
	    formattedMessage?: string;
	} type CompilationErrorType = 'JSONError' | 'IOError' | 'ParserError' | 'DocstringParsingError' | 'SyntaxError' | 'DeclarationError' | 'TypeError' | 'UnimplementedFeatureError' | 'InternalCompilerError' | 'Exception' | 'CompilerError' | 'FatalError' | 'Warning';
	export interface CompilationSource {
	    /** Identifier of the source (used in source maps) */
	    id: number;
	    /** The AST object */
	    ast: AstNode;
	    /** The legacy AST object */
	    legacyAST: AstNodeLegacy;
	}
	export interface AstNode {
	    absolutePath?: string;
	    exportedSymbols?: Object;
	    id: number;
	    nodeType: string;
	    nodes?: Array<AstNode>;
	    src: string;
	    literals?: Array<string>;
	    file?: string;
	    scope?: number;
	    sourceUnit?: number;
	    symbolAliases?: Array<string>;
	    [x: string]: any;
	}
	export interface AstNodeLegacy {
	    id: number;
	    name: string;
	    src: string;
	    children?: Array<AstNodeLegacy>;
	    attributes?: AstNodeAtt;
	}
	export interface AstNodeAtt {
	    operator?: string;
	    string?: null;
	    type?: string;
	    value?: string;
	    constant?: boolean;
	    name?: string;
	    public?: boolean;
	    exportedSymbols?: Object;
	    argumentTypes?: null;
	    absolutePath?: string;
	    [x: string]: any;
	}
	export interface CompiledContract {
	    /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
	    abi: ABIDescription[];
	    metadata: string;
	    /** User documentation (natural specification) */
	    userdoc: UserDocumentation;
	    /** Developer documentation (natural specification) */
	    devdoc: DeveloperDocumentation;
	    /** Intermediate representation (string) */
	    ir: string;
	    /** EVM-related outputs */
	    evm: {
	        assembly: string;
	        legacyAssembly: {};
	        /** Bytecode and related details. */
	        bytecode: BytecodeObject;
	        deployedBytecode: BytecodeObject;
	        /** The list of function hashes */
	        methodIdentifiers: {
	            [functionIdentifier: string]: string;
	        };
	        gasEstimates: {
	            creation: {
	                codeDepositCost: string;
	                executionCost: 'infinite' | string;
	                totalCost: 'infinite' | string;
	            };
	            external: {
	                [functionIdentifier: string]: string;
	            };
	            internal: {
	                [functionIdentifier: string]: 'infinite' | string;
	            };
	        };
	    };
	    /** eWASM related outputs */
	    ewasm: {
	        /** S-expressions format */
	        wast: string;
	        /** Binary format (hex string) */
	        wasm: string;
	    };
	}
	export type ABIDescription = FunctionDescription | EventDescription;
	export interface FunctionDescription {
	    /** Type of the method. default is 'function' */
	    type?: 'function' | 'constructor' | 'fallback';
	    /** The name of the function. Constructor and fallback functions never have a name */
	    name?: string;
	    /** List of parameters of the method. Fallback functions don’t have inputs. */
	    inputs?: ABIParameter[];
	    /** List of the output parameters for the method, if any */
	    outputs?: ABIParameter[];
	    /** State mutability of the method */
	    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
	    /** true if function accepts Ether, false otherwise. Default is false */
	    payable?: boolean;
	    /** true if function is either pure or view, false otherwise. Default is false  */
	    constant?: boolean;
	}
	export interface EventDescription {
	    type: 'event';
	    name: string;
	    inputs: ABIParameter & {
	        /** true if the field is part of the log’s topics, false if it one of the log’s data segment. */
	        indexed: boolean;
	    }[];
	    /** true if the event was declared as anonymous. */
	    anonymous: boolean;
	}
	export interface ABIParameter {
	    /** The name of the parameter */
	    name: string;
	    /** The canonical type of the parameter */
	    type: ABITypeParameter;
	    /** Used for tuple types */
	    components?: ABIParameter[];
	}
	export type ABITypeParameter = 'uint' | 'uint[]' | 'int' | 'int[]' | 'address' | 'address[]' | 'bool' | 'bool[]' | 'fixed' | 'fixed[]' | 'ufixed' | 'ufixed[]' | 'bytes' | 'bytes[]' | 'function' | 'function[]' | 'tuple' | 'tuple[]' | string;
	export interface UserDocumentation {
	    methods: UserMethodList;
	    notice: string;
	}
	export type UserMethodList = {
	    [functionIdentifier: string]: UserMethodDoc;
	} & {
	    'constructor'?: string;
	};
	export interface UserMethodDoc {
	    notice: string;
	}
	export interface DeveloperDocumentation {
	    author: string;
	    title: string;
	    details: string;
	    methods: DevMethodList;
	}
	export interface DevMethodList {
	    [functionIdentifier: string]: DevMethodDoc;
	}
	export interface DevMethodDoc {
	    author: string;
	    details: string;
	    return: string;
	    returns: {
	        [param: string]: string;
	    };
	    params: {
	        [param: string]: string;
	    };
	}
	export interface BytecodeObject {
	    /** The bytecode as a hex string. */
	    object: string;
	    /** Opcodes list */
	    opcodes: string;
	    /** The source mapping as a string. See the source mapping definition. */
	    sourceMap: string;
	    /** If given, this is an unlinked object. */
	    linkReferences?: {
	        [contractName: string]: {
	            /** Byte offsets into the bytecode. */
	            [library: string]: {
	                start: number;
	                length: number;
	            }[];
	        };
	    };
	}
	export {};

}
declare module 'dist/packages/api/lib/compiler/type/index' {
	export * from 'dist/packages/api/lib/compiler/type/input';
	export * from 'dist/packages/api/lib/compiler/type/output';

}
declare module 'packages/utils/src/lib/tools/event-name' {
	/** Create the name of the event for a call */
	export function callEvent(name: string, key: string, id: number): string;
	/** Create the name of the event for a listen */
	export function listenEvent(name: string, key: string): string;

}
declare module 'packages/utils/src/lib/tools/method-path' {
	/** Create a method path based on the method name and the path */
	export function getMethodPath(method: string, path?: string): string;
	/** Get the root name of a path */
	export function getRootPath(path: string): string;

}
declare module 'packages/utils/src/lib/types/service' {
	export type IPluginService<T extends Record<string, any> = any> = {
	    methods: string[];
	    readonly path: string;
	} & T;
	export type GetPluginService<S extends Record<string, any>> = S extends IPluginService<infer I> ? S : IPluginService<S>;

}
declare module 'packages/utils/src/lib/types/status' {
	export interface Status {
	    /** Display an icon or number */
	    key: number | 'edited' | 'succeed' | 'loading' | 'failed' | 'none';
	    /** Bootstrap css color */
	    type?: 'success' | 'info' | 'warning' | 'error';
	    /** Describe the status on mouseover */
	    title?: string;
	}
	export type StatusEvents = {
	    statusChanged: (status: Status) => void;
	};

}
declare module 'packages/utils/src/lib/types/api' {
	import { StatusEvents } from 'packages/utils/src/lib/types/status';
	export interface Api {
	    events: {
	        [key: string]: (...args: any[]) => void;
	    } & StatusEvents;
	    methods: {
	        [key: string]: (...args: any[]) => void;
	    };
	}
	export type EventKey<T extends Api> = Extract<keyof T['events'], string>;
	export type EventParams<T extends Api, K extends EventKey<T>> = T extends Api ? Parameters<T['events'][K]> : any[];
	export type EventCallback<T extends Api, K extends EventKey<T>> = T extends Api ? T['events'][K] : (...payload: any[]) => void;
	export type MethodKey<T extends Api> = Extract<keyof T['methods'], string>;
	export type MethodParams<T extends Api, K extends MethodKey<T>> = T extends Api ? Parameters<T['methods'][K]> : any[];
	export interface EventApi<T extends Api> {
	    on: <event extends EventKey<T>>(name: event, cb: T['events'][event]) => void;
	}
	export type MethodApi<T extends Api> = {
	    [m in Extract<keyof T['methods'], string>]: (...args: Parameters<T['methods'][m]>) => Promise<ReturnType<T['methods'][m]>>;
	};
	export type CustomApi<T extends Api> = EventApi<T> & MethodApi<T>;
	/** A map of Api used to describe all the plugin's api in the project */
	export type ApiMap = Readonly<Record<string, Api>>;
	/** A map of plugin based on the ApiMap. It enforces the PluginEngine */
	export type PluginApi<T extends ApiMap> = {
	    [name in keyof T]: CustomApi<T[name]>;
	};
	export type API<T extends Api> = {
	    [M in keyof T['methods']]: T['methods'][M] | Promise<T['methods'][M]>;
	};

}
declare module 'packages/utils/src/lib/types/plugin' {
	import type { IPluginService } from 'packages/utils/src/lib/types/service';
	import { EventCallback, MethodParams, MethodKey, EventKey, Api, ApiMap, EventParams } from 'packages/utils/src/lib/types/api';
	export interface PluginBase<T extends Api = any, App extends ApiMap = any> {
	    methods: string[];
	    activateService: Record<string, () => Promise<IPluginService>>;
	    /** Listen on an event from another plugin */
	    on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Listen one time on an event from another plugin, then remove event listener */
	    once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Stop listening on an event from another plugin */
	    off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key): void;
	    /** Call a method of another plugin */
	    call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key, ...payload: MethodParams<App[Name], Key>): Promise<any>;
	    /** Clear calls in queue of a plugin called by plugin */
	    cancel<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key): void;
	    /** Emit an event */
	    emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void;
	}

}
declare module 'packages/utils/src/lib/tools/service' {
	import type { IPluginService, GetPluginService } from 'packages/utils/src/lib/types/service';
	import type { Api, ApiMap } from 'packages/utils/src/lib/types/api';
	import type { PluginBase } from 'packages/utils/src/lib/types/plugin';
	/** Check if the plugin is an instance of PluginService */
	export const isPluginService: (service: any) => service is PluginService;
	/**
	 * Return the methods of a service, except "constructor" and methods starting with "_"
	 * @param instance The instance of a class to get the method from
	 */
	export function getMethods(service: IPluginService): any;
	/**
	 * Create a plugin service
	 * @param path The path of the service separated by '.' (ex: 'box.profile')
	 * @param service The service template
	 * @note If the service doesn't provide a property "methods" then all methods are going to be exposed by default
	 */
	export function createService<T extends Record<string, any>>(path: string, service: T): GetPluginService<T>;
	/**
	 * Connect the service to the plugin client
	 * @param client The main client of the plugin
	 * @param service A service to activate
	 */
	export function activateService<T extends Api = any, App extends ApiMap = any>(client: PluginBase<T, App>, service: IPluginService): any;
	/**
	 * A node that forward the call to the right path
	 */
	export abstract class PluginService implements IPluginService {
	    methods: string[];
	    abstract readonly path: string;
	    protected abstract plugin: PluginBase;
	    emit(key: string, ...payload: any[]): void;
	    /**
	     * Create a subservice under this service
	     * @param name The name of the subservice inside this service
	     * @param service The subservice to add
	     */
	    createService<S extends Record<string, any>>(name: string, service: S): Promise<GetPluginService<S>>;
	    /**
	     * Prepare a service to be lazy loaded.
	     * Service can be activated by doing client.activateService(path)
	     * @param name The name of the subservice inside this service
	     * @param factory A function to create the service on demand
	     */
	    prepareService<S extends Record<string, any>>(name: string, factory: () => S): void;
	}

}
declare module 'packages/utils/src/lib/types/message' {
	export interface PluginRequest {
	    /** The name of the plugin making the request */
	    from: string;
	    /** @deprecated Will be remove in the next version */
	    isFromNative?: boolean;
	    /**
	     * The path to access the request inside the plugin
	     * @example 'remixd.cmd.git'
	     */
	    path?: string;
	} type MessageActions = 'on' | 'off' | 'once' | 'call' | 'response' | 'emit' | 'cancel'; type OldMessageActions = 'notification' | 'request' | 'response' | 'listen';
	export interface Message {
	    id: number;
	    action: MessageActions | OldMessageActions;
	    name: string;
	    key: string;
	    payload: any;
	    requestInfo: PluginRequest;
	    error?: Error | string;
	}
	export {};

}
declare module 'packages/utils/src/lib/types/queue' {
	import type { PluginRequest } from 'packages/utils/src/lib/types/message';
	export interface PluginQueueInterface {
	    setCurrentRequest(request: PluginRequest): void;
	    callMethod(method: string, args: any[]): void;
	    letContinue(): void;
	    cancel(): void;
	}

}
declare module 'packages/utils/src/lib/types/profile' {
	import { MethodKey, Api, ApiMap, EventKey } from 'packages/utils/src/lib/types/api';
	/** Describe a plugin */
	export interface Profile<T extends Api = any> {
	    name: string;
	    displayName?: string;
	    methods?: MethodKey<T>[];
	    events?: EventKey<T>[];
	    permission?: boolean;
	    hash?: string;
	    description?: string;
	    documentation?: string;
	    version?: string;
	    kind?: string;
	    canActivate?: string[];
	    icon?: string;
	}
	export interface LocationProfile {
	    location: string;
	}
	export interface ExternalProfile {
	    url: string;
	}
	export interface HostProfile extends Profile {
	    methods: ('addView' | 'removeView' | 'focus' | string)[];
	}
	export interface LibraryProfile<T extends Api = any> extends Profile<T> {
	    events?: EventKey<T>[];
	    notifications?: {
	        [name: string]: string[];
	    };
	}
	/** A map of profile */
	export type ProfileMap<T extends ApiMap> = Partial<{
	    [name in keyof T]: Profile<T[name]>;
	}>;
	/** Extract the API of a profile */
	export type ApiFromProfile<T> = T extends Profile<infer I> ? I : never;
	/** Create an ApiMap from a Profile Map */
	export type ApiMapFromProfileMap<T extends ProfileMap<any>> = {
	    [name in keyof T]: ApiFromProfile<T[name]>;
	};
	/** Transform an ApiMap into a profile map */
	export type ProfileMapFromApiMap<T extends ApiMap> = Readonly<{
	    [name in keyof T]: Profile<T[name]>;
	}>;

}
declare module 'packages/utils/src/lib/tools/queue' {
	import { PluginQueueInterface } from 'packages/utils/src/lib/types/queue';
	import type { PluginRequest } from 'packages/utils/src/lib/types/message';
	import { Profile } from 'packages/utils/src/lib/types/profile';
	import { Api } from 'packages/utils/src/lib/types/api';
	import { PluginOptions } from '@remixproject/plugin-utils';
	export class PluginQueueItem<T extends Api = any> implements PluginQueueInterface {
	    private resolve;
	    private reject;
	    private timer;
	    private running;
	    private args;
	    method: Profile<T>['methods'][number];
	    timedout: boolean;
	    canceled: boolean;
	    finished: boolean;
	    request: PluginRequest;
	    private options;
	    constructor(resolve: (value: unknown) => void, reject: (reason: any) => void, request: PluginRequest, method: Profile<T>['methods'][number], options: PluginOptions, args: any[]);
	    setCurrentRequest(request: PluginRequest): void;
	    callMethod(method: string, args: any[]): void;
	    letContinue(): void;
	    cancel(): void;
	    run(): Promise<void>;
	}

}
declare module 'packages/utils/src/lib/types/options' {
	export interface PluginOptions {
	    /** The time to wait for a call to be executed before going to next call in the queue */
	    queueTimeout?: number;
	}

}
declare module 'packages/utils/src/index' {
	export * from 'packages/utils/src/lib/tools/event-name';
	export * from 'packages/utils/src/lib/tools/method-path';
	export * from 'packages/utils/src/lib/tools/service';
	export * from 'packages/utils/src/lib/tools/queue';
	export * from 'packages/utils/src/lib/types/api';
	export * from 'packages/utils/src/lib/types/message';
	export * from 'packages/utils/src/lib/types/plugin';
	export * from 'packages/utils/src/lib/types/profile';
	export * from 'packages/utils/src/lib/types/service';
	export * from 'packages/utils/src/lib/types/status';
	export * from 'packages/utils/src/lib/types/queue';
	export * from 'packages/utils/src/lib/types/options';

}
declare module 'dist/packages/api/lib/compiler/api' {
	import { CompilationResult, CompilationFileSources, lastCompilationResult, CondensedCompilationInput, SourcesInput } from 'dist/packages/api/lib/compiler/type';
	import { StatusEvents, Api } from '@remixproject/plugin-utils';
	export interface ICompiler extends Api {
	    events: {
	        compilationFinished: (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => void;
	    } & StatusEvents;
	    methods: {
	        getCompilationResult(): lastCompilationResult;
	        compile(fileName: string): void;
	        setCompilerConfig(settings: CondensedCompilationInput): void;
	        compileWithParameters(targets: SourcesInput, settings: CondensedCompilationInput): lastCompilationResult;
	    };
	}

}
declare module 'dist/packages/api/lib/compiler/profile' {
	import { ICompiler } from 'dist/packages/api/lib/compiler/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const compilerProfile: LibraryProfile<ICompiler>;

}
declare module 'dist/packages/api/lib/compiler/index' {
	export * from 'dist/packages/api/lib/compiler/api';
	export * from 'dist/packages/api/lib/compiler/type';
	export * from 'dist/packages/api/lib/compiler/profile';

}
declare module 'dist/packages/api/lib/content-import/type' {
	export interface ContentImport {
	    content: any;
	    cleanUrl: string;
	    type: 'github' | 'http' | 'https' | 'swarm' | 'ipfs';
	    url: string;
	}

}
declare module 'dist/packages/api/lib/content-import/api' {
	import { ContentImport } from 'dist/packages/api/lib/content-import/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IContentImport {
	    events: {} & StatusEvents;
	    methods: {
	        resolve(path: string): ContentImport;
	        resolveAndSave(url: string, targetPath: string): string;
	    };
	}

}
declare module 'dist/packages/api/lib/content-import/profile' {
	import { IContentImport } from 'dist/packages/api/lib/content-import/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const contentImportProfile: LibraryProfile<IContentImport>;

}
declare module 'dist/packages/api/lib/content-import/index' {
	export * from 'dist/packages/api/lib/content-import/api';
	export * from 'dist/packages/api/lib/content-import/type';
	export * from 'dist/packages/api/lib/content-import/profile';

}
declare module 'dist/packages/api/lib/editor/type' {
	export interface HighlightPosition {
	    start: {
	        line: number;
	        column: number;
	    };
	    end: {
	        line: number;
	        column: number;
	    };
	}
	export interface Annotation {
	    row: number;
	    column: number;
	    text: string;
	    type: "error" | "warning" | "info";
	}

}
declare module 'dist/packages/api/lib/editor/api' {
	import { HighlightPosition, Annotation } from 'dist/packages/api/lib/editor/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IEditor {
	    events: {} & StatusEvents;
	    methods: {
	        highlight(position: HighlightPosition, filePath: string, hexColor: string): void;
	        discardHighlight(): void;
	        discardHighlightAt(line: number, filePath: string): void;
	        addAnnotation(annotation: Annotation): void;
	        clearAnnotations(): void;
	    };
	}

}
declare module 'dist/packages/api/lib/editor/profile' {
	import { IEditor } from 'dist/packages/api/lib/editor/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const editorProfile: LibraryProfile<IEditor>;

}
declare module 'dist/packages/api/lib/editor/index' {
	export * from 'dist/packages/api/lib/editor/type';
	export * from 'dist/packages/api/lib/editor/api';
	export * from 'dist/packages/api/lib/editor/profile';

}
declare module 'dist/packages/api/lib/file-system/type' {
	export interface Folder {
	    [path: string]: {
	        isDirectory: boolean;
	    };
	}

}
declare module 'dist/packages/api/lib/file-system/api' {
	import { Folder } from 'dist/packages/api/lib/file-system/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IFileSystem {
	    events: {
	        currentFileChanged: (file: string) => void;
	        fileSaved: (file: string) => void;
	        fileAdded: (file: string) => void;
	        fileRemoved: (file: string) => void;
	        fileClosed: (file: string) => void;
	        noFileSelected: () => void;
	        fileRenamed: (oldName: string, newName: string, isFolder: boolean) => void;
	    } & StatusEvents;
	    methods: {
	        /** Open the content of the file in the context (eg: Editor) */
	        open(path: string): void;
	        /** Set the content of a specific file */
	        writeFile(path: string, data: string): void;
	        /** Return the content of a specific file */
	        readFile(path: string): string;
	        /** Change the path of a file */
	        rename(oldPath: string, newPath: string): void;
	        /** Upsert a file with the content of the source file */
	        copyFile(src: string, dest: string): void;
	        /** Create a directory */
	        mkdir(path: string): void;
	        /** Get the list of files in the directory */
	        readdir(path: string): string[];
	        /** Removes a file or directory recursively */
	        remove(path: string): void;
	        /** Get the name of the file currently focused if any */
	        getCurrentFile(): string;
	        /** @deprecated Use readdir */
	        getFolder(path: string): Folder;
	        /** @deprecated Use readFile */
	        getFile(path: string): string;
	        /** @deprecated Use writeFile */
	        setFile(path: string, content: string): void;
	        /** @deprecated Use open */
	        switchFile(path: string): void;
	    };
	}

}
declare module 'dist/packages/api/lib/file-system/profile' {
	import { IFileSystem } from 'dist/packages/api/lib/file-system/api';
	import { LocationProfile, Profile } from '@remixproject/plugin-utils';
	export const filSystemProfile: Profile<IFileSystem> & LocationProfile;

}
declare module 'dist/packages/api/lib/file-system/index' {
	export * from 'dist/packages/api/lib/file-system/api';
	export * from 'dist/packages/api/lib/file-system/type';
	export * from 'dist/packages/api/lib/file-system/profile';

}
declare module 'dist/packages/api/lib/git/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IGitSystem {
	    events: {} & StatusEvents;
	    methods: {
	        clone(url: string): string;
	        checkout(cmd: string): string;
	        init(): string;
	        add(cmd: string): string;
	        commit(cmd: string): string;
	        fetch(cmd: string): string;
	        pull(cmd: string): string;
	        push(cmd: string): string;
	        reset(cmd: string): string;
	        status(cmd: string): string;
	        remote(cmd: string): string;
	        log(): string;
	    };
	}

}
declare module 'dist/packages/api/lib/git/profile' {
	import { IGitSystem } from 'dist/packages/api/lib/git/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const gitProfile: LibraryProfile<IGitSystem>;

}
declare module 'dist/packages/api/lib/git/index' {
	export * from 'dist/packages/api/lib/git/api';
	export * from 'dist/packages/api/lib/git/profile';

}
declare module 'dist/packages/api/lib/network/type' {
	/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
	export interface CustomNetwork {
	    id?: string;
	    name: string;
	    url: string;
	}
	/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
	export type NetworkProvider = 'vm' | 'injected' | 'web3';
	export type Network = {
	    id: '1';
	    name: 'Main';
	} | {
	    id: '2';
	    name: 'Morden (deprecated)';
	} | {
	    id: '3';
	    name: 'Ropsten';
	} | {
	    id: '4';
	    name: 'Rinkeby';
	} | {
	    id: '5';
	    name: 'Goerli';
	} | {
	    id: '42';
	    name: 'Kovan';
	};

}
declare module 'dist/packages/api/lib/network/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	import { NetworkProvider, Network, CustomNetwork } from 'dist/packages/api/lib/network/type';
	/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
	export interface INetwork {
	    events: {
	        providerChanged: (provider: NetworkProvider) => void;
	    } & StatusEvents;
	    methods: {
	        getNetworkProvider(): NetworkProvider;
	        detectNetwork(): Network | Partial<CustomNetwork>;
	        getEndpoint(): string;
	        addNetwork(network: CustomNetwork): void;
	        removeNetwork(name: string): void;
	    };
	}

}
declare module 'dist/packages/api/lib/network/profile' {
	import { INetwork } from 'dist/packages/api/lib/network/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const networkProfile: LibraryProfile<INetwork>;

}
declare module 'dist/packages/api/lib/network/index' {
	export * from 'dist/packages/api/lib/network/api';
	export * from 'dist/packages/api/lib/network/type';
	export * from 'dist/packages/api/lib/network/profile';

}
declare module 'dist/packages/api/lib/plugin-manager/api' {
	import { StatusEvents, Profile } from '@remixproject/plugin-utils';
	export interface IPluginManager {
	    events: {
	        profileUpdated(profile: Profile): void;
	        profileAdded(profile: Profile): void;
	        pluginDeactivated(profile: Profile): void;
	        pluginActivated(profile: Profile): void;
	    } & StatusEvents;
	    methods: {
	        getProfile(name: string): Promise<Profile>;
	        updateProfile(profile: Partial<Profile>): any;
	        activatePlugin(name: string): any;
	        deactivatePlugin(name: string): any;
	        isActive(name: string): boolean;
	        canCall(from: string, to: string, method: string, message?: string): any;
	    };
	}

}
declare module 'dist/packages/api/lib/plugin-manager/profile' {
	import { IPluginManager } from 'dist/packages/api/lib/plugin-manager/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const pluginManagerProfile: LibraryProfile<IPluginManager> & {
	    name: 'manager';
	};

}
declare module 'dist/packages/api/lib/plugin-manager/index' {
	export * from 'dist/packages/api/lib/plugin-manager/api';
	export * from 'dist/packages/api/lib/plugin-manager/profile';

}
declare module 'dist/packages/api/lib/settings/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface ISettings {
	    events: {} & StatusEvents;
	    methods: {
	        getGithubAccessToken(): string;
	    };
	}

}
declare module 'dist/packages/api/lib/settings/profile' {
	import { ISettings } from 'dist/packages/api/lib/settings/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const settingsProfile: LibraryProfile<ISettings>;

}
declare module 'dist/packages/api/lib/settings/index' {
	export * from 'dist/packages/api/lib/settings/api';
	export * from 'dist/packages/api/lib/settings/profile';

}
declare module 'dist/packages/api/lib/theme/types' {
	export interface Theme {
	    url?: string;
	    /** @deprecated Use brightness instead */
	    quality?: 'dark' | 'light';
	    brightness: 'dark' | 'light';
	    colors: {
	        surface: string;
	        background: string;
	        foreground: string;
	        primary: string;
	        primaryContrast: string;
	        secondary?: string;
	        secondaryContrast?: string;
	        success?: string;
	        successContrast?: string;
	        warn: string;
	        warnContrast: string;
	        error: string;
	        errorContrast: string;
	        disabled: string;
	    };
	    breakpoints: {
	        xs: number;
	        sm: number;
	        md: number;
	        lg: number;
	        xl: number;
	    };
	    fontFamily: string;
	    /** A unit to multiply for margin & padding */
	    space: number;
	}
	export interface ThemeUrls {
	    light: string;
	    dark: string;
	}

}
declare module 'dist/packages/api/lib/theme/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	import { Theme } from 'dist/packages/api/lib/theme/types';
	export interface ITheme {
	    events: {
	        themeChanged: (theme: Theme) => void;
	    } & StatusEvents;
	    methods: {
	        currentTheme(): Theme;
	    };
	}

}
declare module 'dist/packages/api/lib/theme/profile' {
	import { ITheme } from 'dist/packages/api/lib/theme/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const themeProfile: LibraryProfile<ITheme>;

}
declare module 'dist/packages/api/lib/theme/index' {
	export * from 'dist/packages/api/lib/theme/api';
	export * from 'dist/packages/api/lib/theme/profile';
	export * from 'dist/packages/api/lib/theme/types';

}
declare module 'dist/packages/api/lib/udapp/type' {
	export type RemixTxEvent = {
	    contractAddress: string;
	    data: string;
	    envMode: 'vm';
	    executionCost: string;
	    from: string;
	    gas: string;
	    hash: string;
	    input: string;
	    logs: any[];
	    returnValue: Uint8Array;
	    status: '0x01' | '0x00';
	    transactionCost: string;
	    transactionHash: string;
	    value: string;
	} | {
	    blockHash: string;
	    blockNumber: number;
	    envMod: 'injected' | 'web3';
	    from: string;
	    gas: number;
	    gasPrice: {
	        c: number[];
	        e: number;
	        s: number;
	    };
	    hash: string;
	    input: string;
	    none: number;
	    r: string;
	    s: string;
	    v: string;
	    status: '0x01' | '0x00';
	    to: string;
	    transactionCost: string;
	    transactionIndex: number;
	    value: {
	        c: number[];
	        e: number;
	        s: number;
	    };
	};
	export interface RemixTx {
	    data: string;
	    from: string;
	    to?: string;
	    timestamp?: string;
	    gasLimit: string;
	    value: string;
	    useCall: boolean;
	}
	export interface RemixTxReceipt {
	    transactionHash: string;
	    status: 0 | 1;
	    gasUsed: string;
	    error: string;
	    return: string;
	    createdAddress?: string;
	}
	export interface VMAccount {
	    privateKey: string;
	    balance: string;
	}
	export interface UdappSettings {
	    selectedAccount: string;
	    selectedEnvMode: 'vm' | 'injected' | 'web3';
	    networkEnvironment: string;
	}

}
declare module 'dist/packages/api/lib/udapp/api' {
	import { RemixTx, RemixTxReceipt, RemixTxEvent, VMAccount, UdappSettings } from 'dist/packages/api/lib/udapp/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IUdapp {
	    events: {
	        newTransaction: (transaction: RemixTxEvent) => void;
	    } & StatusEvents;
	    methods: {
	        sendTransaction(tx: RemixTx): RemixTxReceipt;
	        getAccounts(): string[];
	        createVMAccount(vmAccount: VMAccount): string;
	        getSettings(): UdappSettings;
	        setEnvironmentMode(env: 'vm' | 'injected' | 'web3'): void;
	    };
	}

}
declare module 'dist/packages/api/lib/udapp/profile' {
	import { IUdapp } from 'dist/packages/api/lib/udapp/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const udappProfile: LibraryProfile<IUdapp>;

}
declare module 'dist/packages/api/lib/udapp/index' {
	export * from 'dist/packages/api/lib/udapp/api';
	export * from 'dist/packages/api/lib/udapp/type';
	export * from 'dist/packages/api/lib/udapp/profile';

}
declare module 'dist/packages/api/lib/unit-testing/type' {
	export interface UnitTestResult {
	    totalFailing: number;
	    totalPassing: number;
	    totalTime: number;
	    errors: UnitTestError[];
	}
	export interface UnitTestError {
	    context: string;
	    value: string;
	    message: string;
	}

}
declare module 'dist/packages/api/lib/unit-testing/api' {
	import { UnitTestResult } from 'dist/packages/api/lib/unit-testing/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IUnitTesting {
	    events: {} & StatusEvents;
	    methods: {
	        testFromPath(path: string): UnitTestResult;
	        testFromSource(sourceCode: string): UnitTestResult;
	    };
	}

}
declare module 'dist/packages/api/lib/unit-testing/profile' {
	import { IUnitTesting } from 'dist/packages/api/lib/unit-testing/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const unitTestProfile: LibraryProfile<IUnitTesting>;

}
declare module 'dist/packages/api/lib/unit-testing/index' {
	export * from 'dist/packages/api/lib/unit-testing/api';
	export * from 'dist/packages/api/lib/unit-testing/type';
	export * from 'dist/packages/api/lib/unit-testing/profile';

}
declare module 'dist/packages/api/lib/window/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IWindow {
	    events: {} & StatusEvents;
	    methods: {
	        /** Display an input window */
	        prompt(message?: string): string;
	        /** Ask confirmation for an action */
	        confirm(message: string): boolean;
	        /** Display a message with actions button. Returned the button clicked if any */
	        alert(message: string, actions?: string[]): string | void;
	    };
	}

}
declare module 'dist/packages/api/lib/window/profile' {
	import { IWindow } from 'dist/packages/api/lib/window/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const windowProfile: LibraryProfile<IWindow>;

}
declare module 'dist/packages/api/lib/window/index' {
	export * from 'dist/packages/api/lib/window/api';
	export * from 'dist/packages/api/lib/window/profile';

}
declare module 'dist/packages/api/lib/remix-profile' {
	import { ProfileMap } from '@remixproject/plugin-utils';
	import { ICompiler } from 'dist/packages/api/lib/compiler';
	import { IFileSystem } from 'dist/packages/api/lib/file-system';
	import { IEditor } from 'dist/packages/api/lib/editor';
	import { INetwork } from 'dist/packages/api/lib/network';
	import { IUdapp } from 'dist/packages/api/lib/udapp';
	import { ITheme } from 'dist/packages/api/lib/theme';
	import { IUnitTesting } from 'dist/packages/api/lib/unit-testing';
	import { IContentImport } from 'dist/packages/api/lib/content-import';
	import { ISettings } from 'dist/packages/api/lib/settings';
	import { IPluginManager } from 'dist/packages/api/lib/plugin-manager';
	export interface IRemixApi {
	    manager: IPluginManager;
	    solidity: ICompiler;
	    fileManager: IFileSystem;
	    solidityUnitTesting: IUnitTesting;
	    editor: IEditor;
	    network: INetwork;
	    udapp: IUdapp;
	    contentImport: IContentImport;
	    settings: ISettings;
	    theme: ITheme;
	}
	export type RemixApi = Readonly<IRemixApi>;
	/** @deprecated Use remixProfiles instead. Will be remove in next version */
	export const remixApi: ProfileMap<RemixApi>;
	/** Profiles of all the remix's Native Plugins */
	export const remixProfiles: ProfileMap<RemixApi>;

}
declare module 'dist/packages/api/lib/standard-profile' {
	import { ProfileMap } from '@remixproject/plugin-utils';
	import { ICompiler } from 'dist/packages/api/lib/compiler';
	import { IFileSystem } from 'dist/packages/api/lib/file-system';
	import { IEditor } from 'dist/packages/api/lib/editor';
	import { INetwork } from 'dist/packages/api/lib/network';
	import { IUdapp } from 'dist/packages/api/lib/udapp';
	import { IPluginManager } from 'dist/packages/api/lib/plugin-manager';
	export interface IStandardApi {
	    manager: IPluginManager;
	    solidity: ICompiler;
	    fileManager: IFileSystem;
	    editor: IEditor;
	    network: INetwork;
	    udapp: IUdapp;
	}
	export type StandardApi = Readonly<IStandardApi>;
	/** Profiles of all the standard's Native Plugins */
	export const standardProfiles: ProfileMap<StandardApi>;

}
declare module 'dist/packages/api/index' {
	export * from 'dist/packages/api/lib/compiler';
	export * from 'dist/packages/api/lib/content-import';
	export * from 'dist/packages/api/lib/editor';
	export * from 'dist/packages/api/lib/file-system';
	export * from 'dist/packages/api/lib/git';
	export * from 'dist/packages/api/lib/network';
	export * from 'dist/packages/api/lib/plugin-manager';
	export * from 'dist/packages/api/lib/settings';
	export * from 'dist/packages/api/lib/theme';
	export * from 'dist/packages/api/lib/udapp';
	export * from 'dist/packages/api/lib/unit-testing';
	export * from 'dist/packages/api/lib/window';
	export * from 'dist/packages/api/lib/remix-profile';
	export * from 'dist/packages/api/lib/standard-profile';

}
declare module 'dist/packages/engine/core/lib/abstract' {
	import type { Api, EventKey, EventParams, MethodKey, MethodParams, EventCallback, ApiMap, Profile, PluginRequest, PluginApi, PluginBase, IPluginService } from '@remixproject/plugin-utils';
	export interface RequestParams {
	    name: string;
	    key: string;
	    payload: any[];
	}
	export interface PluginOptions {
	    /** The time to wait for a call to be executed before going to next call in the queue */
	    queueTimeout?: number;
	}
	export class Plugin<T extends Api = any, App extends ApiMap = any> implements PluginBase<T, App> {
	    profile: Profile<T>;
	    activateService: Record<string, () => Promise<any>>;
	    protected requestQueue: Array<() => Promise<any>>;
	    protected currentRequest: PluginRequest;
	    /** Give access to all the plugins registered by the engine */
	    protected app: PluginApi<App>;
	    protected options: PluginOptions;
	    onRegistration?(): void;
	    onActivation?(): void;
	    onDeactivation?(): void;
	    constructor(profile: Profile<T>);
	    get name(): string;
	    get methods(): Extract<keyof T['methods'], string>[];
	    set methods(methods: Extract<keyof T['methods'], string>[]);
	    activate(): any | Promise<any>;
	    deactivate(): any | Promise<any>;
	    setOptions(options?: Partial<PluginOptions>): void;
	    /** Call a method from this plugin */
	    protected callPluginMethod(key: string, args: any[]): any;
	    /** Add a request to the list of current requests */
	    protected addRequest(request: PluginRequest, method: Profile<T>['methods'][number], args: any[]): Promise<unknown>;
	    /**
	     * Ask the plugin manager if current request can call a specific method
	     * @param method The method to call
	     * @param message An optional message to show to the user
	     */
	    askUserPermission(method: MethodKey<T>, message?: string): Promise<boolean>;
	    /**
	     * Called by the engine when a plugin try to activate it
	     * @param from the profile of the plugin activating this plugin
	     * @param method method used to activate this plugin if any
	     */
	    canActivate(from: Profile, method?: string): Promise<boolean>;
	    /**
	     * Called by the engine when a plugin try to deactivate it
	     * @param from the profile of the plugin deactivating this plugin
	     */
	    canDeactivate(from: Profile): Promise<boolean>;
	    /**
	     * Create a service under the client node
	     * @param name The name of the service
	     * @param service The service
	     */
	    createService<S extends Record<string, any>>(name: string, service: S): Promise<IPluginService<S>>;
	    /**
	     * Prepare a service to be lazy loaded
	     * @param name The name of the subservice inside this service
	     * @param factory A function to create the service on demand
	     */
	    prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>>;
	    /** Listen on an event from another plugin */
	    on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Listen once an event from another plugin then remove event listener */
	    once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Stop listening on an event from another plugin */
	    off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key): void;
	    /** Call a method of another plugin */
	    call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key, ...payload: MethodParams<App[Name], Key>): Promise<ReturnType<App[Name]['methods'][Key]>>;
	    /** Emit an event */
	    emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void;
	}

}
declare module 'dist/packages/engine/core/lib/connector' {
	import type { ExternalProfile, Profile, Message } from '@remixproject/plugin-utils';
	import { Plugin, PluginOptions } from 'dist/packages/engine/core/lib/abstract';
	/** List of available gateways for decentralised storage */
	export const defaultGateways: {
	    'ipfs://': (url: any, name: any) => string;
	    'swarm://': (url: any, name: any) => string;
	};
	/** Transform the URL to use a gateway if decentralised storage is specified */
	export function transformUrl({ url, name }: Profile & ExternalProfile): any;
	export interface PluginConnectorOptions extends PluginOptions {
	    /** Usally used to reload the plugin on changes */
	    devMode?: boolean;
	    transformUrl?: (profile: Profile & ExternalProfile) => string;
	    engine?: string;
	}
	export abstract class PluginConnector extends Plugin {
	    protected loaded: boolean;
	    protected id: number;
	    protected pendingRequest: Record<number, (result: any, error: Error | string) => void>;
	    protected options: PluginConnectorOptions;
	    profile: Profile & ExternalProfile;
	    constructor(profile: Profile & ExternalProfile);
	    /**
	     * Send a message to the external plugin
	     * @param message the message passed to the plugin
	     */
	    protected abstract send(message: Partial<Message>): void;
	    /**
	     * Open connection with the plugin
	     * @param url The transformed url the plugin should connect to
	     */
	    protected abstract connect(url: string): any | Promise<any>;
	    /** Close connection with the plugin */
	    protected abstract disconnect(): any | Promise<any>;
	    activate(): Promise<any>;
	    deactivate(): Promise<any>;
	    /** Set options for an external plugin */
	    setOptions(options?: Partial<PluginConnectorOptions>): void;
	    /** Call a method from this plugin */
	    protected callPluginMethod(key: string, payload?: any[]): Promise<any>;
	    /** Perform handshake with the client if not loaded yet */
	    protected handshake(handshakeSpecificPayload?: string[]): Promise<any>;
	    /**
	     * React when a message comes from client
	     * @param message The message sent by the client
	     */
	    protected getMessage(message: Message): Promise<any>;
	}

}
declare module 'dist/packages/engine/core/lib/engine' {
	import type { Profile } from '@remixproject/plugin-utils';
	import { Plugin, PluginOptions } from 'dist/packages/engine/core/lib/abstract';
	export class Engine {
	    private plugins;
	    private events;
	    private listeners;
	    private eventMemory;
	    private manager;
	    onRegistration?(plugin: Plugin): void;
	    /** Update the options of the plugin when being registered */
	    setPluginOption?(profile: Profile): PluginOptions;
	    /**
	     * Broadcast an event to the plugin listening
	     * @param emitter Plugin name that emits the event
	     * @param event The name of the event
	     * @param payload The content of the event
	     */
	    private broadcast;
	    /**
	     * Start listening on an event from another plugin
	     * @param listener The name of the plugin that listen on the event
	     * @param emitter The name of the plugin that emit the event
	     * @param event The name of the event
	     * @param cb Callback function to trigger when the event is trigger
	     */
	    private addListener;
	    /**
	     * Remove an event from the list of a listener's events
	     * @param listener The name of the plugin that was listening on the event
	     * @param emitter The name of the plugin that emitted the event
	     * @param event The name of the event
	     */
	    private removeListener;
	    /**
	     * Create a listener that listen only once on an event
	     * @param listener The name of the plugin that listen on the event
	     * @param emitter The name of the plugin that emitted the event
	     * @param event The name of the event
	     * @param cb Callback function to trigger when event is triggered
	     */
	    private listenOnce;
	    /**
	     * Call a method of a plugin from another
	     * @param caller The name of the plugin that calls the method
	     * @param path The path of the plugin that manages the method
	     * @param method The name of the method
	     * @param payload The argument to pass to the method
	     */
	    private callMethod;
	    /**
	     * Create an object to easily access any registered plugin
	     * @param name Name of the caller plugin
	     * @note This method creates a snapshot at the time of activation
	     */
	    private createApp;
	    /**
	     * Activate a plugin by making its method and event available
	     * @param name The name of the plugin
	     * @note This method is trigger by the plugin manager when a plugin has been activated
	     */
	    private activatePlugin;
	    /**
	     * Deactivate a plugin by removing all its event listeners and making it inaccessible
	     * @param name The name of the plugin
	     * @note This method is trigger by the plugin manager when a plugin has been deactivated
	     */
	    private deactivatePlugin;
	    /**
	     * Update error message when trying to call a method when not activated
	     * @param plugin The deactivated plugin to update the methods from
	     */
	    private updateErrorHandler;
	    /**
	     * Register a plugin to the engine and update the manager
	     * @param plugin The plugin
	     */
	    register(plugins: Plugin | Plugin[]): string | string[];
	    /** Register the manager */
	    private registerManager;
	    /** Remove plugin(s) from engine */
	    remove(names: string | string[]): Promise<void> | Promise<void[]>;
	    /**
	     * Check is a name is already registered
	     * @param name Name of the plugin
	     */
	    isRegistered(name: string): boolean;
	}

}
declare module 'dist/packages/engine/core/lib/library' {
	import type { EventEmitter } from 'events';
	import type { Api, Profile, LibraryProfile, LocationProfile } from '@remixproject/plugin-utils';
	import { Plugin } from 'dist/packages/engine/core/lib/abstract';
	export type LibraryApi<T extends Api, P extends Profile> = {
	    [method in P['methods'][number]]: T['methods'][method];
	} & {
	    events?: EventEmitter;
	} & {
	    render?(): Element;
	}; type LibraryViewProfile = LocationProfile & LibraryProfile;
	export function isViewLibrary(profile: any): profile is LibraryViewProfile;
	export class LibraryPlugin<T extends Api = any, P extends LibraryProfile | LibraryViewProfile = any> extends Plugin {
	    protected library: LibraryApi<T, P>;
	    profile: P;
	    private isView;
	    constructor(library: LibraryApi<T, P>, profile: P);
	    activate(): Promise<void>;
	    deactivate(): void;
	    /** Call a method from this plugin */
	    protected callPluginMethod(key: string, payload: any[]): any;
	}
	export {};

}
declare module 'dist/packages/engine/core/lib/manager' {
	import type { Profile } from '@remixproject/plugin-utils';
	import { Plugin } from 'dist/packages/engine/core/lib/abstract';
	export type BasePluginManager = {
	    getProfile(name: string): Promise<Profile>;
	    updateProfile(profile: Partial<Profile>): Promise<any>;
	    activatePlugin(name: string): Promise<any>;
	    deactivatePlugin(name: string): Promise<any>;
	    isActive(name: string): Promise<boolean>;
	    canCall(from: Profile, to: Profile, method: string): Promise<boolean>;
	    toggleActive(name: string): any;
	    addProfile(profiles: Partial<Profile> | Partial<Profile>[]): any;
	    canActivatePlugin(from: Profile, to: Profile, method?: string): Promise<boolean>;
	    canDeactivatePlugin(from: Profile, to: Profile): Promise<boolean>;
	} & Plugin;
	interface ManagerProfile extends Profile {
	    name: 'manager';
	}
	export class PluginManager extends Plugin implements BasePluginManager {
	    protected profiles: Record<string, Profile>;
	    protected actives: string[];
	    protected onPluginActivated?(profile: Profile): any;
	    protected onPluginDeactivated?(profile: Profile): any;
	    protected onProfileAdded?(profile: Profile): any;
	    constructor(profile?: ManagerProfile);
	    /** Return the name of the caller. If no request provided, this mean that the method has been called from the IDE so we use "manager" */
	    get requestFrom(): string;
	    /** Run engine activation. Implemented by Engine */
	    private engineActivatePlugin;
	    /** Run engine deactivation. Implemented by Engine */
	    private engineDeactivatePlugin;
	    /**
	     * Get the profile if it's registered.
	     * @param name The name of the plugin
	     * @note This method can be overrided
	     */
	    getProfile(name: string): Promise<Profile<any>>;
	    /** Get all the profiles of the manager */
	    getProfiles(): Profile<any>[];
	    /** Get all active profiles of the manager */
	    getActiveProfiles(): Profile<any>[];
	    /**
	     * Update the profile of the plugin
	     * @param profile The Updated version of the plugin
	     * @note Only the caller plugin should be able to update its profile
	     */
	    updateProfile(to: Partial<Profile>): Promise<void>;
	    /**
	     * Add a profile to the list of profile
	     * @param profile The profile to add
	     * @note This method should only be used by the engine
	     */
	    addProfile(profiles: Profile | Profile[]): void | void[];
	    /**
	     * Verify if a plugin is currently active
	     * @param name Name of the plugin
	     */
	    isActive(name: string): Promise<boolean>;
	    /**
	     * Check if caller can activate plugin and activate it if authorized
	     * @param name The name of the plugin to activate
	     */
	    activatePlugin(names: string | string[]): Promise<unknown>;
	    /**
	     * Check if caller can deactivate plugin and deactivate it if authorized
	     * @param name The name of the plugin to activate
	     */
	    deactivatePlugin(names: string | string[]): Promise<unknown>;
	    /**
	     * Activate or deactivate by bypassing permission
	     * @param name The name of the plugin to activate
	     * @note This method should ONLY be used by the IDE
	     */
	    toggleActive(names: string | string[]): Promise<void | void[]>;
	    /**
	     * Check if a plugin can activate another
	     * @param from Profile of the caller plugin
	     * @param to Profile of the target plugin
	     * @note This method should be overrided
	     */
	    canActivatePlugin(from: Profile, to: Profile): Promise<boolean>;
	    /**
	     * Check if a plugin can deactivate another
	     * @param from Profile of the caller plugin
	     * @param to Profile of the target plugin
	     * @note This method should be overrided
	     */
	    canDeactivatePlugin(from: Profile, to: Profile): Promise<boolean>;
	    /**
	     * Check if a plugin can call a method of another
	     * @param from Profile of the caller plugin
	     * @param to Profile of the target plugin
	     * @param method Method targetted by the caller
	     * @param message Method provided by the targetted method plugin
	     */
	    canCall(from: Profile, to: Profile, method: string, message?: string): Promise<boolean>;
	    /**
	     * Check if a plugin can update profile of another one
	     * @param from Profile of the caller plugin
	     * @param to Updates on the profile of the target plugin
	     * @note This method can be overrided
	     */
	    canUpdateProfile(from: Profile, to: Partial<Profile>): Promise<boolean>;
	}
	export {};

}
declare module 'dist/packages/engine/core/index' {
	export * from 'dist/packages/engine/core/lib/abstract';
	export * from 'dist/packages/engine/core/lib/connector';
	export * from 'dist/packages/engine/core/lib/engine';
	export * from 'dist/packages/engine/core/lib/library';
	export * from 'dist/packages/engine/core/lib/manager';

}
declare module 'packages/engine/core/src/lib/abstract' {
	import type { Api, EventKey, EventParams, MethodKey, MethodParams, EventCallback, ApiMap, Profile, PluginRequest, PluginApi, PluginBase, IPluginService, PluginOptions } from '@remixproject/plugin-utils';
	import { PluginQueueItem } from '@remixproject/plugin-utils';
	export interface RequestParams {
	    name: string;
	    key: string;
	    payload: any[];
	}
	export class Plugin<T extends Api = any, App extends ApiMap = any> implements PluginBase<T, App> {
	    profile: Profile<T>;
	    activateService: Record<string, () => Promise<any>>;
	    protected currentRequest: PluginRequest;
	    /** Give access to all the plugins registered by the engine */
	    protected app: PluginApi<App>;
	    protected options: PluginOptions;
	    protected queue: PluginQueueItem[];
	    onRegistration?(): void;
	    onActivation?(): void;
	    onDeactivation?(): void;
	    constructor(profile: Profile<T>);
	    get name(): string;
	    get methods(): Extract<keyof T['methods'], string>[];
	    set methods(methods: Extract<keyof T['methods'], string>[]);
	    activate(): any | Promise<any>;
	    deactivate(): any | Promise<any>;
	    setOptions(options?: Partial<PluginOptions>): void;
	    /** Call a method on this plugin */
	    protected callPluginMethod(key: string, args: any[]): any;
	    protected setCurrentRequest(request: PluginRequest): void;
	    protected letContinue(): void;
	    /** Add a request to the list of current requests */
	    protected addRequest(request: PluginRequest, method: Profile<T>['methods'][number], args: any[]): Promise<unknown>;
	    protected cancelRequests(request: PluginRequest, method: Profile<T>['methods'][number]): void;
	    /**
	     * Ask the plugin manager if current request can call a specific method
	     * @param method The method to call
	     * @param message An optional message to show to the user
	     */
	    askUserPermission(method: MethodKey<T>, message?: string): Promise<boolean>;
	    /**
	     * Called by the engine when a plugin try to activate it
	     * @param from the profile of the plugin activating this plugin
	     * @param method method used to activate this plugin if any
	     */
	    canActivate(from: Profile, method?: string): Promise<boolean>;
	    /**
	     * Called by the engine when a plugin try to deactivate it
	     * @param from the profile of the plugin deactivating this plugin
	     */
	    canDeactivate(from: Profile): Promise<boolean>;
	    /**
	     * Create a service under the client node
	     * @param name The name of the service
	     * @param service The service
	     */
	    createService<S extends Record<string, any>>(name: string, service: S): Promise<IPluginService<S>>;
	    /**
	     * Prepare a service to be lazy loaded
	     * @param name The name of the subservice inside this service
	     * @param factory A function to create the service on demand
	     */
	    prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>>;
	    /** Listen on an event from another plugin */
	    on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Listen once an event from another plugin then remove event listener */
	    once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Stop listening on an event from another plugin */
	    off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key): void;
	    /** Call a method of another plugin */
	    call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key, ...payload: MethodParams<App[Name], Key>): Promise<ReturnType<App[Name]['methods'][Key]>>;
	    /** Cancel a method of another plugin */
	    cancel<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key): Promise<ReturnType<App[Name]['methods'][Key]>>;
	    /** Emit an event */
	    emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void;
	}

}
declare module 'packages/engine/core/src/lib/connector' {
	import type { ExternalProfile, Profile, Message, PluginOptions } from '@remixproject/plugin-utils';
	import { Plugin } from 'packages/engine/core/src/lib/abstract';
	/** List of available gateways for decentralised storage */
	export const defaultGateways: {
	    'ipfs://': (url: any, name: any) => string;
	    'swarm://': (url: any, name: any) => string;
	};
	/** Transform the URL to use a gateway if decentralised storage is specified */
	export function transformUrl({ url, name }: Profile & ExternalProfile): any;
	export interface PluginConnectorOptions extends PluginOptions {
	    /** Usally used to reload the plugin on changes */
	    devMode?: boolean;
	    transformUrl?: (profile: Profile & ExternalProfile) => string;
	    engine?: string;
	}
	export abstract class PluginConnector extends Plugin {
	    protected loaded: boolean;
	    protected id: number;
	    protected pendingRequest: Record<number, (result: any, error: Error | string) => void>;
	    protected options: PluginConnectorOptions;
	    profile: Profile & ExternalProfile;
	    constructor(profile: Profile & ExternalProfile);
	    /**
	     * Send a message to the external plugin
	     * @param message the message passed to the plugin
	     */
	    protected abstract send(message: Partial<Message>): void;
	    /**
	     * Open connection with the plugin
	     * @param url The transformed url the plugin should connect to
	     */
	    protected abstract connect(url: string): any | Promise<any>;
	    /** Close connection with the plugin */
	    protected abstract disconnect(): any | Promise<any>;
	    activate(): Promise<any>;
	    deactivate(): Promise<any>;
	    /** Set options for an external plugin */
	    setOptions(options?: Partial<PluginConnectorOptions>): void;
	    /** Call a method from this plugin */
	    protected callPluginMethod(key: string, payload?: any[]): Promise<any>;
	    /** Perform handshake with the client if not loaded yet */
	    protected handshake(): Promise<any>;
	    /**
	     * React when a message comes from client
	     * @param message The message sent by the client
	     */
	    protected getMessage(message: Message): Promise<any>;
	}

}
declare module 'packages/api/src/lib/compiler/type/input' {
	export interface CompilationInput {
	    /** Source code language */
	    language: 'Solidity' | 'Vyper' | 'lll' | 'assembly' | 'yul';
	    sources: SourcesInput;
	    settings?: CompilerSettings;
	    outputSelection?: CompilerOutputSelection;
	}
	export interface CondensedCompilationInput {
	    language: 'Solidity' | 'Vyper' | 'lll' | 'assembly' | 'yul';
	    optimize: boolean;
	    /** e.g: 0.6.8+commit.0bbfe453 */
	    version: string;
	    evmVersion?: 'istanbul' | 'petersburg' | 'constantinople' | 'byzantium' | 'spuriousDragon' | 'tangerineWhistle' | 'homestead';
	}
	export interface SourceInputUrls {
	    /** Hash of the source file. It is used to verify the retrieved content imported via URLs */
	    keccak256?: string;
	    /**
	     * URL(s) to the source file.
	     * URL(s) should be imported in this order and the result checked against the
	     * keccak256 hash (if available). If the hash doesn't match or none of the
	     * URL(s) result in success, an error should be raised.
	     */
	    urls: string[];
	}
	export interface SourceInputContent {
	    /** Hash of the source file. */
	    keccak256?: string;
	    /** Literal contents of the source file */
	    content: string;
	}
	export interface SourcesInput {
	    [contractName: string]: SourceInputContent | SourceInputUrls;
	}
	export interface CompilerSettings {
	    /** Sorted list of remappings */
	    remappings?: string[];
	    /** Optimizer settings */
	    optimizer?: Partial<CompilerOptimizer>;
	    /** Version of the EVM to compile for. Affects type checking and code generation */
	    evmVersion: 'homestead' | 'tangerineWhistle' | 'spuriousDragon' | 'byzantium' | 'constantinople';
	    /** Metadata settings */
	    metadata?: CompilerMetadata;
	    /** Addresses of the libraries. If not all libraries are given here, it can result in unlinked objects whose output data is different. */
	    libraries: CompilerLibraries;
	}
	export interface CompilerOptimizer {
	    /** disabled by default */
	    enable: boolean;
	    /**
	     * Optimize for how many times you intend to run the code.
	     * Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
	     */
	    runs: number;
	}
	export interface CompilerMetadata {
	    /** Use only literal content and not URLs (false by default) */
	    useLiteralContent: boolean;
	}
	/**
	 * The top level key is the the name of the source file where the library is used.
	 * If remappings are used, this source file should match the global path after remappings were applied.
	 * If this key is an empty string, that refers to a global level.
	 */
	export interface CompilerLibraries {
	    [contractName: string]: {
	        [libName: string]: string;
	    };
	}
	export type OutputType = 'abi' | 'ast' | 'devdoc' | 'userdoc' | 'metadata' | 'ir' | 'evm.assembly' | 'evm.legacyAssembly' | 'evm.bytecode.object' | 'evm.bytecode.opcodes' | 'evm.bytecode.sourceMap' | 'evm.bytecode.linkReferences' | 'evm.deployedBytecode' | 'evm.methodIdentifiers' | 'evm.gasEstimates' | 'ewasm.wast' | 'ewasm.wasm';
	/**
	 * The following can be used to select desired outputs.
	 * If this field is omitted, then the compiler loads and does type checking, but will not generate any outputs apart from errors.
	 * The first level key is the file name and the second is the contract name, where empty contract name refers to the file itself,
	 * while the star refers to all of the contracts.
	 * Note that using a using evm, evm.bytecode, ewasm, etc. will select every
	 * target part of that output. Additionally, * can be used as a wildcard to request everything.
	 */
	export interface CompilerOutputSelection {
	    [file: string]: {
	        [contract: string]: OutputType[];
	    };
	}

}
declare module 'packages/api/src/lib/compiler/type/output' {
	export interface CompilationFileSources {
	    [fileName: string]: {
	        keccak256?: string;
	        content: string;
	        urls?: string[];
	    };
	}
	export interface SourceWithTarget {
	    sources?: CompilationFileSources;
	    target?: string | null | undefined;
	}
	export interface CompilationResult {
	    /** not present if no errors/warnings were encountered */
	    errors?: CompilationError[];
	    /** This contains the file-level outputs. In can be limited/filtered by the outputSelection settings */
	    sources: {
	        [contractName: string]: CompilationSource;
	    };
	    /** This contains the contract-level outputs. It can be limited/filtered by the outputSelection settings */
	    contracts: {
	        /** If the language used has no contract names, this field should equal to an empty string. */
	        [fileName: string]: {
	            [contract: string]: CompiledContract;
	        };
	    };
	}
	export interface lastCompilationResult {
	    data: CompilationResult | null;
	    source: SourceWithTarget | null | undefined;
	}
	export interface CompilationError {
	    /** Location within the source file */
	    sourceLocation?: {
	        file: string;
	        start: number;
	        end: number;
	    };
	    /** Error type */
	    type: CompilationErrorType;
	    /** Component where the error originated, such as "general", "ewasm", etc. */
	    component: 'general' | 'ewasm' | string;
	    severity: 'error' | 'warning';
	    message: string;
	    /** the message formatted with source location */
	    formattedMessage?: string;
	} type CompilationErrorType = 'JSONError' | 'IOError' | 'ParserError' | 'DocstringParsingError' | 'SyntaxError' | 'DeclarationError' | 'TypeError' | 'UnimplementedFeatureError' | 'InternalCompilerError' | 'Exception' | 'CompilerError' | 'FatalError' | 'Warning';
	export interface CompilationSource {
	    /** Identifier of the source (used in source maps) */
	    id: number;
	    /** The AST object */
	    ast: AstNode;
	    /** The legacy AST object */
	    legacyAST: AstNodeLegacy;
	}
	export interface AstNode {
	    absolutePath?: string;
	    exportedSymbols?: Object;
	    id: number;
	    nodeType: string;
	    nodes?: Array<AstNode>;
	    src: string;
	    literals?: Array<string>;
	    file?: string;
	    scope?: number;
	    sourceUnit?: number;
	    symbolAliases?: Array<string>;
	    [x: string]: any;
	}
	export interface AstNodeLegacy {
	    id: number;
	    name: string;
	    src: string;
	    children?: Array<AstNodeLegacy>;
	    attributes?: AstNodeAtt;
	}
	export interface AstNodeAtt {
	    operator?: string;
	    string?: null;
	    type?: string;
	    value?: string;
	    constant?: boolean;
	    name?: string;
	    public?: boolean;
	    exportedSymbols?: Object;
	    argumentTypes?: null;
	    absolutePath?: string;
	    [x: string]: any;
	}
	export interface CompiledContract {
	    /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
	    abi: ABIDescription[];
	    metadata: string;
	    /** User documentation (natural specification) */
	    userdoc: UserDocumentation;
	    /** Developer documentation (natural specification) */
	    devdoc: DeveloperDocumentation;
	    /** Intermediate representation (string) */
	    ir: string;
	    /** EVM-related outputs */
	    evm: {
	        assembly: string;
	        legacyAssembly: {};
	        /** Bytecode and related details. */
	        bytecode: BytecodeObject;
	        deployedBytecode: BytecodeObject;
	        /** The list of function hashes */
	        methodIdentifiers: {
	            [functionIdentifier: string]: string;
	        };
	        gasEstimates: {
	            creation: {
	                codeDepositCost: string;
	                executionCost: 'infinite' | string;
	                totalCost: 'infinite' | string;
	            };
	            external: {
	                [functionIdentifier: string]: string;
	            };
	            internal: {
	                [functionIdentifier: string]: 'infinite' | string;
	            };
	        };
	    };
	    /** eWASM related outputs */
	    ewasm: {
	        /** S-expressions format */
	        wast: string;
	        /** Binary format (hex string) */
	        wasm: string;
	    };
	}
	export type ABIDescription = FunctionDescription | EventDescription;
	export interface FunctionDescription {
	    /** Type of the method. default is 'function' */
	    type?: 'function' | 'constructor' | 'fallback';
	    /** The name of the function. Constructor and fallback functions never have a name */
	    name?: string;
	    /** List of parameters of the method. Fallback functions don’t have inputs. */
	    inputs?: ABIParameter[];
	    /** List of the output parameters for the method, if any */
	    outputs?: ABIParameter[];
	    /** State mutability of the method */
	    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
	    /** true if function accepts Ether, false otherwise. Default is false */
	    payable?: boolean;
	    /** true if function is either pure or view, false otherwise. Default is false  */
	    constant?: boolean;
	}
	export interface EventDescription {
	    type: 'event';
	    name: string;
	    inputs: ABIParameter & {
	        /** true if the field is part of the log’s topics, false if it one of the log’s data segment. */
	        indexed: boolean;
	    }[];
	    /** true if the event was declared as anonymous. */
	    anonymous: boolean;
	}
	export interface ABIParameter {
	    /** The name of the parameter */
	    name: string;
	    /** The canonical type of the parameter */
	    type: ABITypeParameter;
	    /** Used for tuple types */
	    components?: ABIParameter[];
	}
	export type ABITypeParameter = 'uint' | 'uint[]' | 'int' | 'int[]' | 'address' | 'address[]' | 'bool' | 'bool[]' | 'fixed' | 'fixed[]' | 'ufixed' | 'ufixed[]' | 'bytes' | 'bytes[]' | 'function' | 'function[]' | 'tuple' | 'tuple[]' | string;
	export interface UserDocumentation {
	    methods: UserMethodList;
	    notice: string;
	}
	export type UserMethodList = {
	    [functionIdentifier: string]: UserMethodDoc;
	} & {
	    'constructor'?: string;
	};
	export interface UserMethodDoc {
	    notice: string;
	}
	export interface DeveloperDocumentation {
	    author: string;
	    title: string;
	    details: string;
	    methods: DevMethodList;
	}
	export interface DevMethodList {
	    [functionIdentifier: string]: DevMethodDoc;
	}
	export interface DevMethodDoc {
	    author: string;
	    details: string;
	    return: string;
	    returns: {
	        [param: string]: string;
	    };
	    params: {
	        [param: string]: string;
	    };
	}
	export interface BytecodeObject {
	    /** The bytecode as a hex string. */
	    object: string;
	    /** Opcodes list */
	    opcodes: string;
	    /** The source mapping as a string. See the source mapping definition. */
	    sourceMap: string;
	    /** If given, this is an unlinked object. */
	    linkReferences?: {
	        [contractName: string]: {
	            /** Byte offsets into the bytecode. */
	            [library: string]: {
	                start: number;
	                length: number;
	            }[];
	        };
	    };
	}
	export {};

}
declare module 'packages/api/src/lib/compiler/type/index' {
	export * from 'packages/api/src/lib/compiler/type/input';
	export * from 'packages/api/src/lib/compiler/type/output';

}
declare module 'packages/api/src/lib/compiler/api' {
	import { CompilationResult, CompilationFileSources, lastCompilationResult, CondensedCompilationInput, SourcesInput } from 'packages/api/src/lib/compiler/type';
	import { StatusEvents, Api } from '@remixproject/plugin-utils';
	export interface ICompiler extends Api {
	    events: {
	        compilationFinished: (fileName: string, source: CompilationFileSources, languageVersion: string, data: CompilationResult) => void;
	    } & StatusEvents;
	    methods: {
	        getCompilationResult(): lastCompilationResult;
	        compile(fileName: string): void;
	        setCompilerConfig(settings: CondensedCompilationInput): void;
	        compileWithParameters(targets: SourcesInput, settings: CondensedCompilationInput): lastCompilationResult;
	    };
	}

}
declare module 'packages/api/src/lib/compiler/profile' {
	import { ICompiler } from 'packages/api/src/lib/compiler/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const compilerProfile: LibraryProfile<ICompiler>;

}
declare module 'packages/api/src/lib/compiler/index' {
	export * from 'packages/api/src/lib/compiler/api';
	export * from 'packages/api/src/lib/compiler/type';
	export * from 'packages/api/src/lib/compiler/profile';

}
declare module 'packages/api/src/lib/content-import/type' {
	export interface ContentImport {
	    content: any;
	    cleanUrl: string;
	    type: 'github' | 'http' | 'https' | 'swarm' | 'ipfs';
	    url: string;
	}

}
declare module 'packages/api/src/lib/content-import/api' {
	import { ContentImport } from 'packages/api/src/lib/content-import/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IContentImport {
	    events: {} & StatusEvents;
	    methods: {
	        resolve(path: string): ContentImport;
	        resolveAndSave(url: string, targetPath: string): string;
	    };
	}

}
declare module 'packages/api/src/lib/content-import/profile' {
	import { IContentImport } from 'packages/api/src/lib/content-import/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const contentImportProfile: LibraryProfile<IContentImport>;

}
declare module 'packages/api/src/lib/content-import/index' {
	export * from 'packages/api/src/lib/content-import/api';
	export * from 'packages/api/src/lib/content-import/type';
	export * from 'packages/api/src/lib/content-import/profile';

}
declare module 'packages/api/src/lib/editor/type' {
	export interface HighlightPosition {
	    start: {
	        line: number;
	        column: number;
	    };
	    end: {
	        line: number;
	        column: number;
	    };
	}
	export interface HighLightOptions {
	    focus: boolean;
	}
	export interface Annotation {
	    row: number;
	    column: number;
	    text: string;
	    type: "error" | "warning" | "info";
	}

}
declare module 'packages/api/src/lib/editor/api' {
	import { HighlightPosition, Annotation } from 'packages/api/src/lib/editor/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	import { HighLightOptions } from '@remixproject/plugin-api';
	export interface IEditor {
	    events: StatusEvents;
	    methods: {
	        highlight(position: HighlightPosition, filePath: string, hexColor: string, opt?: HighLightOptions): void;
	        discardHighlight(): void;
	        discardHighlightAt(line: number, filePath: string): void;
	        addAnnotation(annotation: Annotation): void;
	        clearAnnotations(): void;
	        gotoLine(line: number, col: number): void;
	    };
	}

}
declare module 'packages/api/src/lib/editor/profile' {
	import { IEditor } from 'packages/api/src/lib/editor/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const editorProfile: LibraryProfile<IEditor>;

}
declare module 'packages/api/src/lib/editor/index' {
	export * from 'packages/api/src/lib/editor/type';
	export * from 'packages/api/src/lib/editor/api';
	export * from 'packages/api/src/lib/editor/profile';

}
declare module 'packages/api/src/lib/file-system/file-manager/type' {
	export interface Folder {
	    [path: string]: {
	        isDirectory: boolean;
	    };
	}

}
declare module 'packages/api/src/lib/file-system/file-manager/api' {
	import { Folder } from 'packages/api/src/lib/file-system/file-manager/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IFileSystem {
	    events: {
	        currentFileChanged: (file: string) => void;
	        fileSaved: (file: string) => void;
	        fileAdded: (file: string) => void;
	        folderAdded: (file: string) => void;
	        fileRemoved: (file: string) => void;
	        fileClosed: (file: string) => void;
	        noFileSelected: () => void;
	        fileRenamed: (oldName: string, newName: string, isFolder: boolean) => void;
	    } & StatusEvents;
	    methods: {
	        /** Open the content of the file in the context (eg: Editor) */
	        open(path: string): void;
	        /** Set the content of a specific file */
	        writeFile(path: string, data: string): void;
	        /** Return the content of a specific file */
	        readFile(path: string): string;
	        /** Change the path of a file */
	        rename(oldPath: string, newPath: string): void;
	        /** Upsert a file with the content of the source file */
	        copyFile(src: string, dest: string): void;
	        /** Create a directory */
	        mkdir(path: string): void;
	        /** Get the list of files in the directory */
	        readdir(path: string): string[];
	        /** Removes a file or directory recursively */
	        remove(path: string): void;
	        /** Get the name of the file currently focused if any */
	        getCurrentFile(): string;
	        /** close all files */
	        closeAllFiles(): void;
	        /** close a file */
	        closeFile(): void;
	        /** @deprecated Use readdir */
	        getFolder(path: string): Folder;
	        /** @deprecated Use readFile */
	        getFile(path: string): string;
	        /** @deprecated Use writeFile */
	        setFile(path: string, content: string): void;
	        /** @deprecated Use open */
	        switchFile(path: string): void;
	    };
	}

}
declare module 'packages/api/src/lib/file-system/file-manager/profile' {
	import { IFileSystem } from 'packages/api/src/lib/file-system/file-manager/api';
	import { LocationProfile, Profile } from '@remixproject/plugin-utils';
	export const filSystemProfile: Profile<IFileSystem> & LocationProfile;

}
declare module 'packages/api/src/lib/file-system/file-manager/index' {
	export * from 'packages/api/src/lib/file-system/file-manager/api';
	export * from 'packages/api/src/lib/file-system/file-manager/type';
	export * from 'packages/api/src/lib/file-system/file-manager/profile';

}
declare module 'packages/api/src/lib/file-system/file-panel/type' {
	export interface customAction {
	    id: string;
	    name: string;
	    type: customActionType[];
	    path: string[];
	    extension: string[];
	    pattern: string[];
	    sticky?: boolean;
	    label?: string;
	}
	export type customActionType = 'file' | 'folder';

}
declare module 'packages/api/src/lib/file-system/file-panel/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	import { customAction } from 'packages/api/src/lib/file-system/file-panel/type';
	export interface IFilePanel {
	    events: {
	        setWorkspace: (workspace: any) => void;
	        workspaceRenamed: (workspace: any) => void;
	        workspaceDeleted: (workspace: any) => void;
	        workspaceCreated: (workspace: any) => void;
	        customAction: (cmd: customAction) => void;
	    } & StatusEvents;
	    methods: {
	        getCurrentWorkspace(): {
	            name: string;
	            isLocalhost: boolean;
	            absolutePath: string;
	        };
	        getWorkspaces(): string[];
	        deleteWorkspace(name: string): void;
	        createWorkspace(name: string, isEmpty: boolean): void;
	        renameWorkspace(oldName: string, newName: string): void;
	        registerContextMenuItem(cmd: customAction): void;
	    };
	}

}
declare module 'packages/api/src/lib/file-system/file-panel/profile' {
	import { IFilePanel as IFilePanel } from 'packages/api/src/lib/file-system/file-panel/api';
	import { LocationProfile, Profile } from '@remixproject/plugin-utils';
	export const filePanelProfile: Profile<IFilePanel> & LocationProfile;

}
declare module 'packages/api/src/lib/file-system/file-panel/index' {
	export * from 'packages/api/src/lib/file-system/file-panel/api';
	export * from 'packages/api/src/lib/file-system/file-panel/profile';
	export * from 'packages/api/src/lib/file-system/file-panel/type';

}
declare module 'packages/api/src/lib/dgit/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IDgitSystem {
	    events: StatusEvents;
	    methods: {
	        init(): void;
	        add(cmd: any): string;
	        commit(cmd: any): string;
	        status(cmd: any): any[];
	        rm(cmd: any): string;
	        log(cmd: any): any[];
	        lsfiles(cmd: any): any[];
	        readblob(cmd: any): {
	            oid: string;
	            blob: Uint8Array;
	        };
	        resolveref(cmd: any): string;
	        branch(cmd: any): void;
	        checkout(cmd: any): void;
	        branches(): string[];
	        currentbranch(): string;
	        push(cmd: any): string;
	        pull(cmd: any): void;
	        setIpfsConfig(config: any): boolean;
	        zip(): void;
	        setItem(name: string, content: string): void;
	        getItem(name: string): string;
	        import(cmd: any): void;
	        export(cmd: any): void;
	        remotes(): any[];
	        addremote(cmd: any): void;
	        delremote(cmd: any): void;
	        clone(cmd: any): void;
	        localStorageUsed(): any;
	    };
	}

}
declare module 'packages/api/src/lib/dgit/profile' {
	import { IDgitSystem } from 'packages/api/src/lib/dgit/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const dGitProfile: LibraryProfile<IDgitSystem>;

}
declare module 'packages/api/src/lib/dgit/index' {
	export * from 'packages/api/src/lib/dgit/api';
	export * from 'packages/api/src/lib/dgit/profile';

}
declare module 'packages/api/src/lib/git/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IGitSystem {
	    events: {} & StatusEvents;
	    methods: {
	        clone(url: string): string;
	        checkout(cmd: string): string;
	        init(): string;
	        add(cmd: string): string;
	        commit(cmd: string): string;
	        fetch(cmd: string): string;
	        pull(cmd: string): string;
	        push(cmd: string): string;
	        reset(cmd: string): string;
	        status(cmd: string): string;
	        remote(cmd: string): string;
	        log(): string;
	    };
	}

}
declare module 'packages/api/src/lib/git/profile' {
	import { IGitSystem } from 'packages/api/src/lib/git/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const gitProfile: LibraryProfile<IGitSystem>;

}
declare module 'packages/api/src/lib/git/index' {
	export * from 'packages/api/src/lib/git/api';
	export * from 'packages/api/src/lib/git/profile';

}
declare module 'packages/api/src/lib/network/type' {
	/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
	export interface CustomNetwork {
	    id?: string;
	    name: string;
	    url: string;
	}
	/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
	export type NetworkProvider = 'vm' | 'injected' | 'web3';
	export type Network = {
	    id: '1';
	    name: 'Main';
	} | {
	    id: '2';
	    name: 'Morden (deprecated)';
	} | {
	    id: '3';
	    name: 'Ropsten';
	} | {
	    id: '4';
	    name: 'Rinkeby';
	} | {
	    id: '5';
	    name: 'Goerli';
	} | {
	    id: '42';
	    name: 'Kovan';
	};

}
declare module 'packages/api/src/lib/network/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	import { NetworkProvider, Network, CustomNetwork } from 'packages/api/src/lib/network/type';
	/** @deprecated: current version in Remix IDE. To improve to match standard JSON RPC methods */
	export interface INetwork {
	    events: {
	        providerChanged: (provider: NetworkProvider) => void;
	    } & StatusEvents;
	    methods: {
	        getNetworkProvider(): NetworkProvider;
	        detectNetwork(): Network | Partial<CustomNetwork>;
	        getEndpoint(): string;
	        addNetwork(network: CustomNetwork): void;
	        removeNetwork(name: string): void;
	    };
	}

}
declare module 'packages/api/src/lib/network/profile' {
	import { INetwork } from 'packages/api/src/lib/network/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const networkProfile: LibraryProfile<INetwork>;

}
declare module 'packages/api/src/lib/network/index' {
	export * from 'packages/api/src/lib/network/api';
	export * from 'packages/api/src/lib/network/type';
	export * from 'packages/api/src/lib/network/profile';

}
declare module 'packages/api/src/lib/plugin-manager/api' {
	import { StatusEvents, Profile } from '@remixproject/plugin-utils';
	export interface IPluginManager {
	    events: {
	        profileUpdated(profile: Profile): void;
	        profileAdded(profile: Profile): void;
	        pluginDeactivated(profile: Profile): void;
	        pluginActivated(profile: Profile): void;
	    } & StatusEvents;
	    methods: {
	        getProfile(name: string): Promise<Profile>;
	        updateProfile(profile: Partial<Profile>): any;
	        activatePlugin(name: string): any;
	        deactivatePlugin(name: string): any;
	        isActive(name: string): boolean;
	        canCall(from: string, to: string, method: string, message?: string): any;
	    };
	}

}
declare module 'packages/api/src/lib/plugin-manager/profile' {
	import { IPluginManager } from 'packages/api/src/lib/plugin-manager/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const pluginManagerProfile: LibraryProfile<IPluginManager> & {
	    name: 'manager';
	};

}
declare module 'packages/api/src/lib/plugin-manager/index' {
	export * from 'packages/api/src/lib/plugin-manager/api';
	export * from 'packages/api/src/lib/plugin-manager/profile';

}
declare module 'packages/api/src/lib/settings/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface ISettings {
	    events: {} & StatusEvents;
	    methods: {
	        getGithubAccessToken(): string;
	    };
	}

}
declare module 'packages/api/src/lib/settings/profile' {
	import { ISettings } from 'packages/api/src/lib/settings/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const settingsProfile: LibraryProfile<ISettings>;

}
declare module 'packages/api/src/lib/settings/index' {
	export * from 'packages/api/src/lib/settings/api';
	export * from 'packages/api/src/lib/settings/profile';

}
declare module 'packages/api/src/lib/theme/types' {
	export interface Theme {
	    url?: string;
	    /** @deprecated Use brightness instead */
	    quality?: 'dark' | 'light';
	    brightness: 'dark' | 'light';
	    colors: {
	        surface: string;
	        background: string;
	        foreground: string;
	        primary: string;
	        primaryContrast: string;
	        secondary?: string;
	        secondaryContrast?: string;
	        success?: string;
	        successContrast?: string;
	        warn: string;
	        warnContrast: string;
	        error: string;
	        errorContrast: string;
	        disabled: string;
	    };
	    breakpoints: {
	        xs: number;
	        sm: number;
	        md: number;
	        lg: number;
	        xl: number;
	    };
	    fontFamily: string;
	    /** A unit to multiply for margin & padding */
	    space: number;
	}
	export interface ThemeUrls {
	    light: string;
	    dark: string;
	}

}
declare module 'packages/api/src/lib/theme/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	import { Theme } from 'packages/api/src/lib/theme/types';
	export interface ITheme {
	    events: {
	        themeChanged: (theme: Theme) => void;
	    } & StatusEvents;
	    methods: {
	        currentTheme(): Theme;
	    };
	}

}
declare module 'packages/api/src/lib/theme/profile' {
	import { ITheme } from 'packages/api/src/lib/theme/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const themeProfile: LibraryProfile<ITheme>;

}
declare module 'packages/api/src/lib/theme/index' {
	export * from 'packages/api/src/lib/theme/api';
	export * from 'packages/api/src/lib/theme/profile';
	export * from 'packages/api/src/lib/theme/types';

}
declare module 'packages/api/src/lib/udapp/type' {
	export type RemixTxEvent = {
	    contractAddress: string;
	    data: string;
	    envMode: 'vm';
	    executionCost: string;
	    from: string;
	    gas: string;
	    hash: string;
	    input: string;
	    logs: any[];
	    returnValue: Uint8Array;
	    status: '0x01' | '0x00';
	    transactionCost: string;
	    transactionHash: string;
	    value: string;
	} | {
	    blockHash: string;
	    blockNumber: number;
	    envMod: 'injected' | 'web3';
	    from: string;
	    gas: number;
	    gasPrice: {
	        c: number[];
	        e: number;
	        s: number;
	    };
	    hash: string;
	    input: string;
	    none: number;
	    r: string;
	    s: string;
	    v: string;
	    status: '0x01' | '0x00';
	    to: string;
	    transactionCost: string;
	    transactionIndex: number;
	    value: {
	        c: number[];
	        e: number;
	        s: number;
	    };
	};
	export interface RemixTx {
	    data: string;
	    from: string;
	    to?: string;
	    timestamp?: string;
	    gasLimit: string;
	    value: string;
	    useCall: boolean;
	}
	export interface RemixTxReceipt {
	    transactionHash: string;
	    status: 0 | 1;
	    gasUsed: string;
	    error: string;
	    return: string;
	    createdAddress?: string;
	}
	export interface VMAccount {
	    privateKey: string;
	    balance: string;
	}
	export interface UdappSettings {
	    selectedAccount: string;
	    selectedEnvMode: 'vm' | 'injected' | 'web3';
	    networkEnvironment: string;
	}

}
declare module 'packages/api/src/lib/udapp/api' {
	import { RemixTx, RemixTxReceipt, RemixTxEvent, VMAccount, UdappSettings } from 'packages/api/src/lib/udapp/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IUdapp {
	    events: {
	        newTransaction: (transaction: RemixTxEvent) => void;
	    } & StatusEvents;
	    methods: {
	        sendTransaction(tx: RemixTx): RemixTxReceipt;
	        getAccounts(): string[];
	        createVMAccount(vmAccount: VMAccount): string;
	        getSettings(): UdappSettings;
	        setEnvironmentMode(env: 'vm' | 'injected' | 'web3'): void;
	    };
	}

}
declare module 'packages/api/src/lib/udapp/profile' {
	import { IUdapp } from 'packages/api/src/lib/udapp/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const udappProfile: LibraryProfile<IUdapp>;

}
declare module 'packages/api/src/lib/udapp/index' {
	export * from 'packages/api/src/lib/udapp/api';
	export * from 'packages/api/src/lib/udapp/type';
	export * from 'packages/api/src/lib/udapp/profile';

}
declare module 'packages/api/src/lib/unit-testing/type' {
	export interface UnitTestResult {
	    totalFailing: number;
	    totalPassing: number;
	    totalTime: number;
	    errors: UnitTestError[];
	}
	export interface UnitTestError {
	    context: string;
	    value: string;
	    message: string;
	}

}
declare module 'packages/api/src/lib/unit-testing/api' {
	import { UnitTestResult } from 'packages/api/src/lib/unit-testing/type';
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IUnitTesting {
	    events: {} & StatusEvents;
	    methods: {
	        testFromPath(path: string): UnitTestResult;
	        testFromSource(sourceCode: string): UnitTestResult;
	    };
	}

}
declare module 'packages/api/src/lib/unit-testing/profile' {
	import { IUnitTesting } from 'packages/api/src/lib/unit-testing/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const unitTestProfile: LibraryProfile<IUnitTesting>;

}
declare module 'packages/api/src/lib/unit-testing/index' {
	export * from 'packages/api/src/lib/unit-testing/api';
	export * from 'packages/api/src/lib/unit-testing/type';
	export * from 'packages/api/src/lib/unit-testing/profile';

}
declare module 'packages/api/src/lib/window/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IWindow {
	    events: {} & StatusEvents;
	    methods: {
	        /** Display an input window */
	        prompt(message?: string): string;
	        /** Ask confirmation for an action */
	        confirm(message: string): boolean;
	        /** Display a message with actions button. Returned the button clicked if any */
	        alert(message: string, actions?: string[]): string | void;
	    };
	}

}
declare module 'packages/api/src/lib/window/profile' {
	import { IWindow } from 'packages/api/src/lib/window/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const windowProfile: LibraryProfile<IWindow>;

}
declare module 'packages/api/src/lib/window/index' {
	export * from 'packages/api/src/lib/window/api';
	export * from 'packages/api/src/lib/window/profile';

}
declare module 'packages/api/src/lib/vscextapi/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	export interface IVScodeExtAPI {
	    events: {} & StatusEvents;
	    methods: {
	        executeCommand(extension: string, command: string, payload?: any[]): any;
	    };
	}

}
declare module 'packages/api/src/lib/vscextapi/profile' {
	import { IVScodeExtAPI } from 'packages/api/src/lib/vscextapi/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const vscodeExtProfile: LibraryProfile<IVScodeExtAPI>;

}
declare module 'packages/api/src/lib/vscextapi/index' {
	export * from 'packages/api/src/lib/vscextapi/api';
	export * from 'packages/api/src/lib/vscextapi/profile';

}
declare module 'packages/api/src/lib/terminal/type' {
	export type TerminalMessage = {
	    value: any;
	    type: 'html' | 'log' | 'info' | 'warn' | 'error';
	};

}
declare module 'packages/api/src/lib/terminal/api' {
	import { StatusEvents } from '@remixproject/plugin-utils';
	import { TerminalMessage } from 'packages/api/src/lib/terminal/type';
	export interface ITerminal {
	    events: {} & StatusEvents;
	    methods: {
	        log(message: TerminalMessage): void;
	    };
	}

}
declare module 'packages/api/src/lib/terminal/profile' {
	import { ITerminal } from 'packages/api/src/lib/terminal/api';
	import { LibraryProfile } from '@remixproject/plugin-utils';
	export const terminalProfile: LibraryProfile<ITerminal>;

}
declare module 'packages/api/src/lib/terminal/index' {
	export * from 'packages/api/src/lib/terminal/api';
	export * from 'packages/api/src/lib/terminal/type';
	export * from 'packages/api/src/lib/terminal/profile';

}
declare module 'packages/api/src/lib/remix-profile' {
	import { ProfileMap } from '@remixproject/plugin-utils';
	import { ICompiler } from 'packages/api/src/lib/compiler';
	import { IFileSystem } from 'packages/api/src/lib/file-system/file-manager';
	import { IEditor } from 'packages/api/src/lib/editor';
	import { INetwork } from 'packages/api/src/lib/network';
	import { IUdapp } from 'packages/api/src/lib/udapp';
	import { ITheme } from 'packages/api/src/lib/theme';
	import { IUnitTesting } from 'packages/api/src/lib/unit-testing';
	import { IContentImport } from 'packages/api/src/lib/content-import';
	import { ISettings } from 'packages/api/src/lib/settings';
	import { IVScodeExtAPI } from 'packages/api/src/lib/vscextapi';
	import { IPluginManager } from 'packages/api/src/lib/plugin-manager';
	import { IFilePanel } from 'packages/api/src/lib/file-system/file-panel';
	import { IDgitSystem } from 'packages/api/src/lib/dgit';
	import { ITerminal } from 'packages/api/src/lib/terminal';
	export interface IRemixApi {
	    manager: IPluginManager;
	    solidity: ICompiler;
	    fileManager: IFileSystem;
	    filePanel: IFilePanel;
	    dGitProvider: IDgitSystem;
	    solidityUnitTesting: IUnitTesting;
	    editor: IEditor;
	    network: INetwork;
	    udapp: IUdapp;
	    contentImport: IContentImport;
	    settings: ISettings;
	    theme: ITheme;
	    vscodeExtAPI: IVScodeExtAPI;
	    terminal: ITerminal;
	}
	export type RemixApi = Readonly<IRemixApi>;
	/** @deprecated Use remixProfiles instead. Will be remove in next version */
	export const remixApi: ProfileMap<RemixApi>;
	/** Profiles of all the remix's Native Plugins */
	export const remixProfiles: ProfileMap<RemixApi>;

}
declare module 'packages/api/src/lib/standard-profile' {
	import { ProfileMap } from '@remixproject/plugin-utils';
	import { ICompiler } from 'packages/api/src/lib/compiler';
	import { IFileSystem } from 'packages/api/src/lib/file-system/file-manager';
	import { IEditor } from 'packages/api/src/lib/editor';
	import { INetwork } from 'packages/api/src/lib/network';
	import { IUdapp } from 'packages/api/src/lib/udapp';
	import { IPluginManager } from 'packages/api/src/lib/plugin-manager';
	export interface IStandardApi {
	    manager: IPluginManager;
	    solidity: ICompiler;
	    fileManager: IFileSystem;
	    editor: IEditor;
	    network: INetwork;
	    udapp: IUdapp;
	}
	export type StandardApi = Readonly<IStandardApi>;
	/** Profiles of all the standard's Native Plugins */
	export const standardProfiles: ProfileMap<StandardApi>;

}
declare module 'packages/api/src/index' {
	export * from 'packages/api/src/lib/compiler';
	export * from 'packages/api/src/lib/content-import';
	export * from 'packages/api/src/lib/editor';
	export * from 'packages/api/src/lib/file-system/file-manager';
	export * from 'packages/api/src/lib/file-system/file-panel';
	export * from 'packages/api/src/lib/dgit';
	export * from 'packages/api/src/lib/git';
	export * from 'packages/api/src/lib/network';
	export * from 'packages/api/src/lib/plugin-manager';
	export * from 'packages/api/src/lib/settings';
	export * from 'packages/api/src/lib/theme';
	export * from 'packages/api/src/lib/udapp';
	export * from 'packages/api/src/lib/unit-testing';
	export * from 'packages/api/src/lib/window';
	export * from 'packages/api/src/lib/remix-profile';
	export * from 'packages/api/src/lib/standard-profile';

}
declare module 'packages/engine/core/src/lib/manager' {
	import type { Profile } from '@remixproject/plugin-utils';
	import { Plugin } from 'packages/engine/core/src/lib/abstract';
	export type BasePluginManager = {
	    getProfile(name: string): Promise<Profile>;
	    updateProfile(profile: Partial<Profile>): Promise<any>;
	    activatePlugin(name: string): Promise<any>;
	    deactivatePlugin(name: string): Promise<any>;
	    isActive(name: string): Promise<boolean>;
	    canCall(from: Profile, to: Profile, method: string): Promise<boolean>;
	    toggleActive(name: string): any;
	    addProfile(profiles: Partial<Profile> | Partial<Profile>[]): any;
	    canActivatePlugin(from: Profile, to: Profile, method?: string): Promise<boolean>;
	    canDeactivatePlugin(from: Profile, to: Profile): Promise<boolean>;
	} & Plugin;
	interface ManagerProfile extends Profile {
	    name: 'manager';
	}
	export class PluginManager extends Plugin implements BasePluginManager {
	    protected profiles: Record<string, Profile>;
	    protected actives: string[];
	    protected onPluginActivated?(profile: Profile): any;
	    protected onPluginDeactivated?(profile: Profile): any;
	    protected onProfileAdded?(profile: Profile): any;
	    constructor(profile?: ManagerProfile);
	    /** Return the name of the caller. If no request provided, this mean that the method has been called from the IDE so we use "manager" */
	    get requestFrom(): string;
	    /** Run engine activation. Implemented by Engine */
	    private engineActivatePlugin;
	    /** Run engine deactivation. Implemented by Engine */
	    private engineDeactivatePlugin;
	    /**
	     * Get the profile if it's registered.
	     * @param name The name of the plugin
	     * @note This method can be overrided
	     */
	    getProfile(name: string): Promise<Profile<any>>;
	    /** Get all the profiles of the manager */
	    getProfiles(): Profile<any>[];
	    /** Get all active profiles of the manager */
	    getActiveProfiles(): Profile<any>[];
	    /**
	     * Update the profile of the plugin
	     * @param profile The Updated version of the plugin
	     * @note Only the caller plugin should be able to update its profile
	     */
	    updateProfile(to: Partial<Profile>): Promise<void>;
	    /**
	     * Add a profile to the list of profile
	     * @param profile The profile to add
	     * @note This method should only be used by the engine
	     */
	    addProfile(profiles: Profile | Profile[]): void | void[];
	    /**
	     * Verify if a plugin is currently active
	     * @param name Name of the plugin
	     */
	    isActive(name: string): Promise<boolean>;
	    /**
	     * Check if caller can activate plugin and activate it if authorized
	     * @param name The name of the plugin to activate
	     */
	    activatePlugin(names: string | string[]): Promise<unknown>;
	    /**
	     * Check if caller can deactivate plugin and deactivate it if authorized
	     * @param name The name of the plugin to activate
	     */
	    deactivatePlugin(names: string | string[]): Promise<unknown>;
	    /**
	     * Activate or deactivate by bypassing permission
	     * @param name The name of the plugin to activate
	     * @note This method should ONLY be used by the IDE
	     */
	    toggleActive(names: string | string[]): Promise<void | void[]>;
	    /**
	     * Check if a plugin can activate another
	     * @param from Profile of the caller plugin
	     * @param to Profile of the target plugin
	     * @note This method should be overrided
	     */
	    canActivatePlugin(from: Profile, to: Profile): Promise<boolean>;
	    /**
	     * Check if a plugin can deactivate another
	     * @param from Profile of the caller plugin
	     * @param to Profile of the target plugin
	     * @note This method should be overrided
	     */
	    canDeactivatePlugin(from: Profile, to: Profile): Promise<boolean>;
	    /**
	     * Check if a plugin can call a method of another
	     * @param from Profile of the caller plugin
	     * @param to Profile of the target plugin
	     * @param method Method targetted by the caller
	     * @param message Method provided by the targetted method plugin
	     */
	    canCall(from: Profile, to: Profile, method: string, message?: string): Promise<boolean>;
	    /**
	     * Check if a plugin can update profile of another one
	     * @param from Profile of the caller plugin
	     * @param to Updates on the profile of the target plugin
	     * @note This method can be overrided
	     */
	    canUpdateProfile(from: Profile, to: Partial<Profile>): Promise<boolean>;
	}
	export {};

}
declare module 'packages/engine/core/src/lib/engine' {
	import type { Profile, PluginOptions } from '@remixproject/plugin-utils';
	import { Plugin } from 'packages/engine/core/src/lib/abstract';
	export class Engine {
	    private plugins;
	    private events;
	    private listeners;
	    private eventMemory;
	    private manager;
	    onRegistration?(plugin: Plugin): void;
	    /** Update the options of the plugin when being registered */
	    setPluginOption?(profile: Profile): PluginOptions;
	    /**
	     * Broadcast an event to the plugin listening
	     * @param emitter Plugin name that emits the event
	     * @param event The name of the event
	     * @param payload The content of the event
	     */
	    private broadcast;
	    /**
	     * Start listening on an event from another plugin
	     * @param listener The name of the plugin that listen on the event
	     * @param emitter The name of the plugin that emit the event
	     * @param event The name of the event
	     * @param cb Callback function to trigger when the event is trigger
	     */
	    private addListener;
	    /**
	     * Remove an event from the list of a listener's events
	     * @param listener The name of the plugin that was listening on the event
	     * @param emitter The name of the plugin that emitted the event
	     * @param event The name of the event
	     */
	    private removeListener;
	    /**
	     * Create a listener that listen only once on an event
	     * @param listener The name of the plugin that listen on the event
	     * @param emitter The name of the plugin that emitted the event
	     * @param event The name of the event
	     * @param cb Callback function to trigger when event is triggered
	     */
	    private listenOnce;
	    /**
	     * Call a method of a plugin from another
	     * @param caller The name of the plugin that calls the method
	     * @param path The path of the plugin that manages the method
	     * @param method The name of the method
	     * @param payload The argument to pass to the method
	     */
	    private callMethod;
	    /**
	     * Cancels calls from a plugin to another
	     * @param caller The name of the plugin that calls the method
	     * @param path The path of the plugin that manages the method
	     * @param method The name of the method to be cancelled, if is empty cancels all calls from plugin
	     */
	    private cancelMethod;
	    /**
	     * Create an object to easily access any registered plugin
	     * @param name Name of the caller plugin
	     * @note This method creates a snapshot at the time of activation
	     */
	    private createApp;
	    /**
	     * Activate a plugin by making its method and event available
	     * @param name The name of the plugin
	     * @note This method is trigger by the plugin manager when a plugin has been activated
	     */
	    private activatePlugin;
	    /**
	     * Deactivate a plugin by removing all its event listeners and making it inaccessible
	     * @param name The name of the plugin
	     * @note This method is trigger by the plugin manager when a plugin has been deactivated
	     */
	    private deactivatePlugin;
	    /**
	     * Update error message when trying to call a method when not activated
	     * @param plugin The deactivated plugin to update the methods from
	     */
	    private updateErrorHandler;
	    /**
	     * Register a plugin to the engine and update the manager
	     * @param plugin The plugin
	     */
	    register(plugins: Plugin | Plugin[]): string | string[];
	    /** Register the manager */
	    private registerManager;
	    /** Remove plugin(s) from engine */
	    remove(names: string | string[]): Promise<void> | Promise<void[]>;
	    /**
	     * Check is a name is already registered
	     * @param name Name of the plugin
	     */
	    isRegistered(name: string): boolean;
	}

}
declare module 'packages/engine/core/src/lib/library' {
	/// <reference types="node" />
	import type { EventEmitter } from 'events';
	import type { Api, Profile, LibraryProfile, LocationProfile } from '@remixproject/plugin-utils';
	import { Plugin } from 'packages/engine/core/src/lib/abstract';
	export type LibraryApi<T extends Api, P extends Profile> = {
	    [method in P['methods'][number]]: T['methods'][method];
	} & {
	    events?: EventEmitter;
	} & {
	    render?(): Element;
	}; type LibraryViewProfile = LocationProfile & LibraryProfile;
	export function isViewLibrary(profile: any): profile is LibraryViewProfile;
	export class LibraryPlugin<T extends Api = any, P extends LibraryProfile | LibraryViewProfile = any> extends Plugin {
	    protected library: LibraryApi<T, P>;
	    profile: P;
	    private isView;
	    constructor(library: LibraryApi<T, P>, profile: P);
	    activate(): Promise<void>;
	    deactivate(): void;
	    /** Call a method from this plugin */
	    protected callPluginMethod(key: string, payload: any[]): any;
	}
	export {};

}
declare module 'packages/engine/core/src/index' {
	export * from 'packages/engine/core/src/lib/abstract';
	export * from 'packages/engine/core/src/lib/connector';
	export * from 'packages/engine/core/src/lib/engine';
	export * from 'packages/engine/core/src/lib/library';
	export * from 'packages/engine/core/src/lib/manager';

}
declare module 'dist/packages/engine/node/lib/child-process' {
	/// <reference types="node" />
	import type { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils';
	import { PluginConnector } from '@remixproject/engine';
	import { ChildProcess } from 'child_process';
	export class ChildProcessPlugin extends PluginConnector {
	    private readonly listener;
	    process: ChildProcess;
	    constructor(profile: Profile & ExternalProfile);
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): void;
	    protected disconnect(): void;
	}

}
declare module 'dist/packages/engine/node/index' {
	export * from 'dist/packages/engine/node/lib/child-process';

}
declare module 'dist/packages/engine/theia/lib/engine-theia' {
	export function engineTheia(): string;

}
declare module 'dist/packages/engine/theia/index' {
	export * from 'dist/packages/engine/theia/lib/engine-theia';

}
declare module 'dist/packages/engine/vscode/lib/command' {
	import { Plugin, PluginOptions } from '@remixproject/engine';
	import { Profile } from '@remixproject/plugin-utils';
	import { Disposable } from 'vscode';
	export const transformCmd: (name: string, method: string) => string;
	export interface CommandOptions extends PluginOptions {
	    transformCmd: (name: string, method: string) => string;
	}
	/**
	 * Connect methods of the plugins with a command depending on the transformCmd function pass as option
	 */
	export class CommandPlugin extends Plugin {
	    subscriptions: Disposable[];
	    options: CommandOptions;
	    constructor(profile: Profile);
	    setOptions(options: Partial<CommandOptions>): void;
	    activate(): void;
	    deactivate(): void;
	}

}
declare module 'dist/packages/engine/vscode/lib/dynamic-list' {
	import { Plugin, PluginOptions } from '@remixproject/engine';
	import { TreeDataProvider, EventEmitter, TreeView, TreeItem } from 'vscode'; type ID = string | number;
	export class Item<I> extends TreeItem {
	    private item;
	    constructor(label: string, pluginName: string, item: I);
	}
	export class List<I> implements TreeDataProvider<I> {
	    private name;
	    private list;
	    private options;
	    render: EventEmitter<I>;
	    onDidChangeTreeData: import("vscode").Event<I>;
	    constructor(name: string, initial?: I[]);
	    setOptions(options: Partial<ListOptions>): void;
	    reset(list: I[]): void;
	    getParent(): any;
	    getTreeItem(element: I): Item<I>;
	    getChildren(): I[];
	}
	export interface ListOptions {
	    idKey: string;
	    labelKey: string;
	}
	export type ListPluginOptions = PluginOptions & ListOptions;
	export class DynamicListPlugin<I, T extends List<I> = List<I>> extends Plugin {
	    private listeners;
	    protected options: ListPluginOptions;
	    protected treeView: TreeView<I>;
	    protected entities: Record<string, I>;
	    protected selected: ID;
	    list: T;
	    constructor(name: string, options?: Partial<ListPluginOptions>);
	    setOptions(options: Partial<ListPluginOptions>): void;
	    activate(): void;
	    deactivate(): void;
	    getIds(): string[];
	    getItem(id: ID): I;
	    getAll(): I[];
	    /** Select on element of the list */
	    select(idOrItem: ID | I): void;
	    /** Reset the entire list */
	    reset(items: I[]): void;
	    /** Add a new item to the list */
	    add(item: I): void;
	    /** Remove one item from the list */
	    remove(id: ID): void;
	    /** Update one item in the list */
	    update(id: ID, item: Partial<I>): void;
	}
	export {};

}
declare module 'dist/packages/engine/vscode/lib/extension' {
	import { PluginConnector } from '@remixproject/engine';
	import { Profile, ExternalProfile, Message } from '@remixproject/plugin-utils';
	export class ExtensionPlugin extends PluginConnector {
	    private extension;
	    private connector;
	    constructor(profile: Profile & ExternalProfile);
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): Promise<void>;
	    protected disconnect(): void;
	}

}
declare module 'dist/packages/engine/vscode/lib/theme' {
	import { Plugin, PluginOptions } from '@remixproject/engine';
	import { API } from '@remixproject/plugin-utils';
	import { ITheme, Theme, ThemeUrls } from '@remixproject/plugin-api';
	import { Disposable, ColorTheme } from 'vscode';
	export interface ThemeOptions extends PluginOptions {
	    urls?: Partial<ThemeUrls>;
	}
	export function getVscodeTheme(color: ColorTheme, urls?: Partial<ThemeUrls>): Theme;
	export class ThemePlugin extends Plugin implements API<ITheme> {
	    protected getTheme: typeof getVscodeTheme;
	    protected options: ThemeOptions;
	    listener: Disposable;
	    constructor(options?: Partial<ThemeOptions>);
	    setOptions(options: Partial<ThemeOptions>): void;
	    onActivation(): void;
	    onDeactivation(): void;
	    currentTheme(): Theme;
	}

}
declare module 'dist/packages/engine/vscode/lib/webview' {
	import { PluginConnector, PluginConnectorOptions } from '@remixproject/engine';
	import { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils';
	import { ExtensionContext, ViewColumn, WebviewPanel } from 'vscode';
	interface WebviewOptions extends PluginConnectorOptions {
	    /** Extension Path */
	    context: ExtensionContext;
	    relativeTo?: 'workspace' | 'extension';
	    column?: ViewColumn;
	    devMode?: boolean;
	}
	export class WebviewPlugin extends PluginConnector {
	    private listeners;
	    panel?: WebviewPanel;
	    options: WebviewOptions;
	    constructor(profile: Profile & ExternalProfile, options: WebviewOptions);
	    setOptions(options: Partial<WebviewOptions>): void;
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): Promise<void>;
	    getMessage(message: Message): Promise<void>;
	    protected disconnect(): void;
	}
	/** Create a webview */
	export function createWebview(profile: Profile, url: string, options: WebviewOptions): Promise<WebviewPanel>;
	export {};

}
declare module 'dist/packages/engine/vscode/lib/window' {
	import { Plugin, PluginOptions } from '@remixproject/engine';
	import { Profile } from '@remixproject/plugin-utils';
	import { QuickPickOptions, InputBoxOptions } from 'vscode';
	export const windowProfile: Profile;
	interface IWindowPlugin {
	    /** Display an input window */
	    prompt(): Thenable<string>;
	    /** Display a select window */
	    select(options: string[]): Thenable<string>;
	    /** Display a select window with local file system: can only select a file */
	    selectFile(): Thenable<string>;
	    /** Display a select window with local file system: can only select a folder */
	    selectFolder(): Thenable<string>;
	    /** Display a message with actions button. Returned the button clicked if any */
	    alert(message: string, actions?: string[]): Thenable<string>;
	    /** Display a warning message with actions button. Returned the button clicked if any */
	    warning(message: string, actions?: string[]): Thenable<string>;
	    /** Display an error message with actions button. Returned the button clicked if any */
	    error(message: string, actions?: string[]): Thenable<string>;
	}
	export class WindowPlugin extends Plugin implements IWindowPlugin {
	    constructor(options?: PluginOptions);
	    prompt(options?: InputBoxOptions): Thenable<string>;
	    select(items: string[], options?: QuickPickOptions): Thenable<string>;
	    selectFile(): Thenable<string>;
	    selectFolder(): Thenable<string>;
	    alert(message: string, actions?: string[]): Thenable<string>;
	    error(message: string, actions?: string[]): Thenable<string>;
	    warning(message: string, actions?: string[]): Thenable<string>;
	}
	export {};

}
declare module 'dist/packages/engine/vscode/lib/filemanager' {
	import { IFileSystem } from '@remixproject/plugin-api';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { CommandPlugin } from 'dist/packages/engine/vscode/lib/command';
	export class FileManagerPlugin extends CommandPlugin implements MethodApi<IFileSystem> {
	    constructor();
	    /** Open the content of the file in the context (eg: Editor) */
	    open(path: string): Promise<void>;
	    /** Set the content of a specific file */
	    writeFile(path: string, data: string): Promise<void>;
	    /** Return the content of a specific file */
	    readFile(path: string): Promise<string>;
	    /** Remove a file */
	    remove(path: string): Promise<void>;
	    /** Change the path of a file */
	    rename(oldPath: string, newPath: string): Promise<void>;
	    /** Upsert a file with the content of the source file */
	    copyFile(src: string, dest: string): Promise<void>;
	    /** Create a directory */
	    mkdir(path: string): Promise<void>;
	    /** Get the list of files in the directory */
	    readdir(path: string): Promise<string[]>;
	    getCurrentFile(): Promise<any>;
	    getFile: (path: string) => Promise<string>;
	    setFile: (path: string, data: string) => Promise<void>;
	    switchFile: (path: string) => Promise<void>;
	    /** @deprecated Use readdir instead */
	    getFolder(path: string): Promise<any>;
	}

}
declare module 'dist/packages/engine/vscode/lib/editor' {
	import { IEditor, Annotation, HighlightPosition } from '@remixproject/plugin-api';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { CommandPlugin, CommandOptions } from 'dist/packages/engine/vscode/lib/command';
	export interface EditorOptions extends CommandOptions {
	    language: string;
	}
	export class EditorPlugin extends CommandPlugin implements MethodApi<IEditor> {
	    private decoration;
	    private decorations;
	    private diagnosticCollection;
	    options: EditorOptions;
	    constructor(options: EditorOptions);
	    setOptions(options: EditorOptions): void;
	    onActivation(): void;
	    onDeactivation(): void;
	    highlight(position: HighlightPosition, filePath: string, themeColor: string): Promise<void>;
	    discardDecorations(): Promise<void>;
	    discardHighlight(): Promise<void>;
	    /**
	     * Alisas of  discardHighlight
	     * Required to match the standard interface of editor
	     */
	    discardHighlightAt(): Promise<void>;
	    addAnnotation(annotation: Annotation, filePath?: string): Promise<void>;
	    clearAnnotations(): Promise<void>;
	}

}
declare module 'dist/packages/engine/vscode/lib/terminal' {
	import { Plugin } from '@remixproject/engine';
	export interface TerminalOptions {
	    name?: string;
	    open: boolean;
	}
	export class TerminalPlugin extends Plugin {
	    private terminals;
	    private outputs;
	    private activeOutput;
	    constructor();
	    onDeactivation(): void;
	    private get active();
	    private getTerminal;
	    private getOutput;
	    /** Open specific terminal (doesn't work with output) */
	    open(name?: string): string;
	    /** Kill a terminal */
	    kill(name?: string): void;
	    /** Write on the current terminal and execute command */
	    exec(command: string, options?: Partial<TerminalOptions>): void;
	    /** Write on the current output */
	    write(text: string, options?: Partial<TerminalOptions>): void;
	}

}
declare module 'dist/packages/engine/vscode/lib/contentimport' {
	import { IContentImport } from '@remixproject/plugin-api';
	import { ContentImport } from '@remixproject/plugin-api';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { CommandPlugin } from 'dist/packages/engine/vscode/lib/command';
	import { RemixURLResolver } from '@remix-project/remix-url-resolver';
	export class ContentImportPlugin extends CommandPlugin implements MethodApi<IContentImport> {
	    urlResolver: RemixURLResolver;
	    constructor();
	    resolve(path: string): Promise<ContentImport>;
	    resolveAndSave(url: string, targetPath: string): Promise<string>;
	}

}
declare module 'dist/packages/engine/vscode/lib/appmanager' {
	import { PluginManager } from '@remixproject/engine';
	export class VscodeAppManager extends PluginManager {
	    pluginsDirectory: string;
	    target: string;
	    constructor();
	    registeredPluginData(): Promise<any>;
	}

}
declare module 'dist/packages/engine/vscode/index' {
	export * from 'dist/packages/engine/vscode/lib/command';
	export * from 'dist/packages/engine/vscode/lib/dynamic-list';
	export * from 'dist/packages/engine/vscode/lib/extension';
	export * from 'dist/packages/engine/vscode/lib/theme';
	export * from 'dist/packages/engine/vscode/lib/webview';
	export * from 'dist/packages/engine/vscode/lib/window';
	export * from 'dist/packages/engine/vscode/lib/filemanager';
	export * from 'dist/packages/engine/vscode/lib/editor';
	export * from 'dist/packages/engine/vscode/lib/terminal';
	export * from 'dist/packages/engine/vscode/lib/contentimport';
	export * from 'dist/packages/engine/vscode/lib/appmanager';

}
declare module 'dist/packages/engine/vscode/util/editor' {
	import { TextEditor } from 'vscode';
	export function getOpenedTextEditor(): TextEditor;
	export function getTextEditorWithDocumentType(type: string): TextEditor;

}
declare module 'dist/packages/engine/vscode/util/path' {
	export function absolutePath(path: string): string;
	export function relativePath(path: any): any;

}
declare module 'dist/packages/engine/web/lib/iframe' {
	import type { Message, Profile, ExternalProfile, LocationProfile } from '@remixproject/plugin-utils';
	import { PluginConnector } from '@remixproject/engine';
	export type IframeProfile = Profile & LocationProfile & ExternalProfile;
	/**
	 * Connect an Iframe client to the engine.
	 * @dev This implements the ViewPlugin as it cannot extends two class. Maybe use a mixin at some point
	 */
	export class IframePlugin extends PluginConnector {
	    profile: IframeProfile;
	    private readonly listener;
	    private iframe;
	    private origin;
	    private source;
	    private url;
	    constructor(profile: IframeProfile);
	    /** Implement "activate" of the ViewPlugin */
	    connect(url: string): Promise<unknown>;
	    /** Implement "deactivate" of the ViewPlugin */
	    disconnect(): Promise<any>;
	    /** Get message from the iframe */
	    private getEvent;
	    /**
	     * Post a message to the iframe of this plugin
	     * @param message The message to post
	     */
	    protected send(message: Partial<Message>): void;
	    /** Create and return the iframe */
	    render(): HTMLIFrameElement;
	}

}
declare module 'dist/packages/engine/web/lib/ws' {
	import type { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils';
	import { PluginConnector, PluginConnectorOptions } from '@remixproject/engine';
	export interface WebsocketOptions extends PluginConnectorOptions {
	    /** Time (in ms) to wait before reconnection after connection closed */
	    reconnectDelay: number;
	}
	export class WebsocketPlugin extends PluginConnector {
	    private account;
	    private readonly listeners;
	    private url;
	    protected socket: WebSocket;
	    protected options: WebsocketOptions;
	    constructor(profile: Profile & ExternalProfile, options?: Partial<WebsocketOptions>);
	    private getEvent;
	    /** Try to reconnect to net websocket if closes */
	    private onclose;
	    /** Open a connection with the server (also used for reconnection) */
	    protected open(): void;
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): void;
	    protected disconnect(): void;
	}

}
declare module 'dist/packages/engine/web/lib/theme' {
	import { Plugin } from '@remixproject/engine';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { ITheme, Theme } from '@remixproject/plugin-api'; type DeepPartial<T> = {
	    [P in keyof T]?: DeepPartial<T[P]>;
	};
	/**
	 * Utils function to create a theme with default value
	 * Default values are taken from material design with colors
	 * - primary: indigo
	 * - secondary: pink
	 * - warn: orange
	 * - error: red
	 */
	export function createTheme(params?: DeepPartial<Theme>): Theme;
	export class ThemePlugin extends Plugin implements MethodApi<ITheme> {
	    protected getTheme: typeof createTheme;
	    protected theme: Theme;
	    constructor();
	    /** Internal API to set the current theme */
	    setTheme(theme: DeepPartial<Theme>): void;
	    /** External API to get the current theme */
	    currentTheme(): Promise<Theme>;
	}
	export {};

}
declare module 'dist/packages/engine/web/lib/window' {
	import { Plugin, PluginOptions } from '@remixproject/engine';
	import { IWindow } from '@remixproject/plugin-api';
	import { MethodApi } from '@remixproject/plugin-utils';
	export class WindowPlugin extends Plugin implements MethodApi<IWindow> {
	    constructor(options?: PluginOptions);
	    /** Display an input window */
	    prompt(message?: string): Promise<string>;
	    /** Ask confirmation for an action */
	    confirm(message: string): Promise<boolean>;
	    /** Display a message with actions button. Returned the button clicked if any */
	    alert(message: string, actions?: string[]): Promise<void>;
	}

}
declare module 'dist/packages/engine/web/lib/web-worker' {
	import type { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils';
	import { PluginConnector, PluginOptions } from '@remixproject/engine'; type WebworkerOptions = WorkerOptions & PluginOptions;
	export class WebWorkerPlugin extends PluginConnector {
	    profile: Profile & ExternalProfile;
	    private worker;
	    protected options: WebworkerOptions;
	    constructor(profile: Profile & ExternalProfile, options?: WebworkerOptions);
	    setOptions(options: Partial<WebworkerOptions>): void;
	    connect(url: string): Promise<any>;
	    disconnect(): void;
	    /** Get message from the iframe */
	    private getEvent;
	    /**
	     * Post a message to the webview of this plugin
	     * @param message The message to post
	     */
	    protected send(message: Partial<Message>): void;
	}
	export {};

}
declare module 'dist/packages/engine/web/lib/host' {
	import type { Profile } from '@remixproject/plugin-utils';
	import { Plugin } from '@remixproject/engine';
	export abstract class HostPlugin extends Plugin {
	    constructor(profile: Profile);
	    /**  Give the name of the current focus plugin */
	    abstract currentFocus(): string;
	    /** Display the view inside the host */
	    abstract focus(name: string): void;
	    /** Add the view of a plugin into the DOM */
	    abstract addView(profile: Profile, view: Element): void;
	    /** Remove the plugin from the view from the DOM */
	    abstract removeView(profile: Profile): void;
	}

}
declare module 'dist/packages/engine/web/lib/view' {
	import type { Profile, LocationProfile } from '@remixproject/plugin-utils';
	import { Plugin } from '@remixproject/engine';
	export function isView<P extends Profile>(profile: Profile): profile is (ViewProfile & P);
	export type ViewProfile = Profile & LocationProfile;
	export abstract class ViewPlugin extends Plugin {
	    profile: ViewProfile;
	    abstract render(): Element;
	    constructor(profile: ViewProfile);
	    activate(): Promise<void>;
	    deactivate(): void;
	}

}
declare module 'dist/packages/engine/web/index' {
	export * from 'dist/packages/engine/web/lib/iframe';
	export * from 'dist/packages/engine/web/lib/ws';
	export * from 'dist/packages/engine/web/lib/theme';
	export * from 'dist/packages/engine/web/lib/window';
	export * from 'dist/packages/engine/web/lib/web-worker';
	export * from 'dist/packages/engine/web/lib/host';
	export * from 'dist/packages/engine/web/lib/view';

}
declare module 'packages/plugin/core/src/lib/client' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { RemixApi } from 'packages/api/src/lib/remix-profile';
	import { GetPluginService, Profile } from 'dist/packages/utils/lib/types/service';
	import type { Api, PluginRequest, ApiMap, EventKey, EventCallback, MethodParams, MethodKey, EventParams, ProfileMap, IPluginService, PluginBase } from 'dist/packages/utils/lib/types/plugin';
	export interface PluginDevMode {
	    /** Port for localhost */
	    port: number | string;
	    origins: string | string[];
	}
	/** Options of the plugin client */
	export interface PluginOptions<T extends ApiMap> {
	    customTheme: boolean;
	    /** define a set of custom apis to implements on the client  */
	    customApi: ProfileMap<T>;
	    /**
	     * Allow a set of origins
	     * You can either a list of origin or a url with a link of origins
	     */
	    allowOrigins: string | string[];
	    /**
	     * options only available for dev mode
	     * @deprecated use allowOrigins instead if you want to limit the parent origin
	     */
	    devMode: Partial<PluginDevMode>;
	}
	export const defaultOptions: Partial<PluginOptions<any>>;
	/** Throw an error if client try to send a message before connection */
	export function handleConnectionError(devMode?: Partial<PluginDevMode>): void;
	export class PluginClient<T extends Api = any, App extends ApiMap = RemixApi> implements PluginBase<T, App> {
	    private id;
	    isLoaded: boolean;
	    events: EventEmitter;
	    currentRequest: PluginRequest;
	    options: PluginOptions<App>;
	    name: string;
	    methods: string[];
	    activateService: Record<string, () => Promise<any>>;
	    onActivation?(): void;
	    constructor(options?: Partial<PluginOptions<App>>);
	    onload(cb?: () => void): Promise<void>;
	    /**
	     * Ask the plugin manager if current request can call a specific method
	     * @param method The method to call
	     * @param message An optional message to show to the user
	     */
	    askUserPermission(method: MethodKey<T>, message?: string): Promise<boolean>;
	    /**
	     * Called before deactivating the plugin
	     * @param from profile of plugin asking to deactivate
	     * @note PluginManager will always be able to deactivate
	     */
	    canDeactivate(from: Profile): boolean;
	    /** Make a call to another plugin */
	    call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key, ...payload: MethodParams<App[Name], Key>): Promise<ReturnType<App[Name]['methods'][Key]>>;
	    cancel<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key?: Key | ''): void;
	    /** Listen on event from another plugin */
	    on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Listen once on event from another plugin */
	    once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Remove all listeners on an event from an external plugin */
	    off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key): void;
	    /** Expose an event for the IDE */
	    emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void;
	    /**
	     * Create a service under the client node
	     * @param name The name of the service
	     * @param service The service
	     */
	    createService<S extends Record<string, any>, Service extends IPluginService<S>>(name: string, service: Service): Promise<GetPluginService<Service>>;
	    /**
	     * Prepare a service to be lazy loaded
	     * @param name The name of the subservice inside this service
	     * @param factory A function to create the service on demand
	     */
	    prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>>;
	}

}
declare module 'packages/plugin/core/src/lib/api' {
	import type { Profile, Api, CustomApi, ProfileMap, ApiMapFromProfileMap, PluginApi, ApiMap } from '@remixproject/plugin-utils';
	import { PluginClient } from 'packages/plugin/core/src/lib/client';
	/**
	 * Create an Api
	 * @param profile The profile of the api
	 */
	export function createApi<T extends Api>(client: PluginClient<any, any>, profile: Profile<T>): CustomApi<T>;
	/**
	 * Transform a list of profile into a map of API
	 * @deprecated Use applyApi from connector instead
	 */
	export function getApiMap<T extends ProfileMap<App>, App extends ApiMap>(client: PluginClient<any, App>, profiles: T): PluginApi<ApiMapFromProfileMap<T>>;

}
declare module 'packages/plugin/core/src/lib/connector' {
	import type { Message, Api, ApiMap, PluginApi } from '@remixproject/plugin-utils';
	import type { IRemixApi } from 'packages/api/src/lib/remix-profile';
	import { PluginClient } from 'packages/plugin/core/src/lib/client';
	export interface ClientConnector {
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get message from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/** Check if a message is an handshake */
	export function isHandshake(message: Partial<Message>): boolean;
	/** Check if an event.data is a plugin message is an handshake */
	export function isPluginMessage(message: any): message is Message;
	/**
	 * Connect a plugin to the engine for a specific connector
	 * @param connector The connector for this plugin
	 * @param client The client instance of the plugin
	 * @example With a client
	 * typescript
	 * const client = new PluginClient()
	 * connectClient(new IframeConnector(client), client);
	 * 
	 */
	export function connectClient(connector: ClientConnector, client?: PluginClient): PluginClient<any, Readonly<IRemixApi>>;
	export type Client<P extends Api, A extends ApiMap> = PluginApi<A> & PluginClient<P, A>;
	/**
	 * Add shortcut to the api requested by the client on it.
	 * @description
	 * Once applied, the client can do client.solidity.compile(x) instead of client.call('solidity', 'compile', x)
	 * @param client The client on which we apply the api
	 */
	export function applyApi(client: PluginClient): void;
	/**
	 * Create & connect a client with a connector.
	 * @param connector A communication layer connector
	 * @param client The plugin client
	 */
	export const createConnectorClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(connector: ClientConnector, client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'packages/plugin/core/src/lib/node' {
	import { PluginClient } from 'packages/plugin/core/src/lib/client';
	/**
	 * Access a service of an external plugin
	 */
	export class PluginNode {
	    private path;
	    private client;
	    /**
	     * @param path Path to external plugin
	     * @param client The main client used in this plugin
	     */
	    constructor(path: string, client: PluginClient);
	    get(name: string): PluginNode;
	    /** Call a method of the node */
	    call(method: string, ...payload: any[]): Promise<any>;
	    /**
	     * Listen to an event from the plugin
	     * @note Event are trigger at the root level yet, not on a specific node
	     */
	    on(method: string, cb: Function): void;
	}

}
declare module 'packages/plugin/core/src/lib/origin' {
	import { PluginOptions } from 'packages/plugin/core/src/lib/client';
	export const remixOrgins = "https://gist.githubusercontent.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173/raw/3367e019335746b73288e3710af2922d4c8ef5a3/origins.json";
	/** Fetch the default origins for remix */
	export function getOriginsFromUrl(url: string): Promise<any>;
	export function getDevmodeOrigins({ devMode }: Partial<PluginOptions<any>>): string[];
	/**
	 * Check if the sender has the right origin
	 * @param origin The origin of the incoming message
	 * @param options client plugin options
	 */
	export function checkOrigin(origin: string, options?: Partial<PluginOptions<any>>): Promise<boolean>;

}
declare module 'packages/plugin/core/src/index' {
	export * from 'packages/plugin/core/src/lib/api';
	export * from 'packages/plugin/core/src/lib/client';
	export * from 'packages/plugin/core/src/lib/connector';
	export * from 'packages/plugin/core/src/lib/node';
	export * from 'packages/plugin/core/src/lib/origin';

}
declare module 'dist/packages/plugin/child-process/lib/connector' {
	import { ClientConnector, Client, PluginClient } from '@remixproject/plugin';
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	export interface WS {
	    send(data: string): void;
	    on(type: 'message', cb: (event: string) => any): this;
	}
	/**
	 * This Websocket connector works with the library ws
	 */
	export class WebsocketConnector implements ClientConnector {
	    private websocket;
	    constructor(websocket: WS);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Websocket plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 *
	 * ---------
	 * @example
	 * typescript
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws)
	 * })
	 * 
	 * ---------
	 * @example
	 * typescript
	 * class MyPlugin extends PluginClient {
	 *  methods = ['hello']
	 *  hello() {
	 *   console.log('Hello World')
	 *  }
	 * }
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws, new MyPlugin())
	 * })
	 * 
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(websocket: WS, client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'dist/packages/plugin/child-process/index' {
	export * from 'dist/packages/plugin/child-process/lib/connector';

}
declare module 'dist/packages/plugin/core/lib/client' {
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	import { RemixApi } from 'packages/api/src/lib/remix-profile';
	import { GetPluginService, Profile } from 'dist/packages/utils/lib/types/service';
	import type { Api, PluginRequest, ApiMap, EventKey, EventCallback, MethodParams, MethodKey, EventParams, ProfileMap, IPluginService, PluginBase } from 'dist/packages/utils/lib/types/plugin';
	export interface PluginDevMode {
	    /** Port for localhost */
	    port: number | string;
	    origins: string | string[];
	}
	/** Options of the plugin client */
	export interface PluginOptions<T extends ApiMap> {
	    customTheme: boolean;
	    /** define a set of custom apis to implements on the client  */
	    customApi: ProfileMap<T>;
	    /**
	     * Allow a set of origins
	     * You can either a list of origin or a url with a link of origins
	     */
	    allowOrigins: string | string[];
	    /**
	     * options only available for dev mode
	     * @deprecated use allowOrigins instead if you want to limit the parent origin
	     */
	    devMode: Partial<PluginDevMode>;
	}
	export const defaultOptions: Partial<PluginOptions<any>>;
	/** Throw an error if client try to send a message before connection */
	export function handleConnectionError(devMode?: Partial<PluginDevMode>): void;
	export class PluginClient<T extends Api = any, App extends ApiMap = RemixApi> implements PluginBase<T, App> {
	    private id;
	    isLoaded: boolean;
	    events: EventEmitter;
	    currentRequest: PluginRequest;
	    options: PluginOptions<App>;
	    name: string;
	    methods: string[];
	    activateService: Record<string, () => Promise<any>>;
	    onActivation?(): void;
	    constructor(options?: Partial<PluginOptions<App>>);
	    onload(cb?: () => void): Promise<void>;
	    /**
	     * Ask the plugin manager if current request can call a specific method
	     * @param method The method to call
	     * @param message An optional message to show to the user
	     */
	    askUserPermission(method: MethodKey<T>, message?: string): Promise<boolean>;
	    /**
	     * Called before deactivating the plugin
	     * @param from profile of plugin asking to deactivate
	     * @note PluginManager will always be able to deactivate
	     */
	    canDeactivate(from: Profile): boolean;
	    /** Make a call to another plugin */
	    call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key, ...payload: MethodParams<App[Name], Key>): Promise<ReturnType<App[Name]['methods'][Key]>>;
	    /** Listen on event from another plugin */
	    on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Listen once on event from another plugin */
	    once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Remove all listeners on an event from an external plugin */
	    off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key): void;
	    /** Expose an event for the IDE */
	    emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void;
	    /**
	     * Create a service under the client node
	     * @param name The name of the service
	     * @param service The service
	     */
	    createService<S extends Record<string, any>, Service extends IPluginService<S>>(name: string, service: Service): Promise<GetPluginService<Service>>;
	    /**
	     * Prepare a service to be lazy loaded
	     * @param name The name of the subservice inside this service
	     * @param factory A function to create the service on demand
	     */
	    prepareService<S extends Record<string, any>>(name: string, factory: () => S): () => Promise<IPluginService<S>>;
	}

}
declare module 'dist/packages/plugin/core/lib/api' {
	import type { Profile, Api, CustomApi, ProfileMap, ApiMapFromProfileMap, PluginApi, ApiMap } from '@remixproject/plugin-utils';
	import { PluginClient } from 'dist/packages/plugin/core/lib/client';
	/**
	 * Create an Api
	 * @param profile The profile of the api
	 */
	export function createApi<T extends Api>(client: PluginClient<any, any>, profile: Profile<T>): CustomApi<T>;
	/**
	 * Transform a list of profile into a map of API
	 * @deprecated Use applyApi from connector instead
	 */
	export function getApiMap<T extends ProfileMap<App>, App extends ApiMap>(client: PluginClient<any, App>, profiles: T): PluginApi<ApiMapFromProfileMap<T>>;

}
declare module 'dist/packages/plugin/core/lib/connector' {
	import type { Message, Api, ApiMap, PluginApi } from '@remixproject/plugin-utils';
	import type { IRemixApi } from '@remixproject/plugin-api';
	import { PluginClient } from 'dist/packages/plugin/core/lib/client';
	export interface ClientConnector {
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get message from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/** Check if a message is an handshake */
	export function isHandshake(message: Partial<Message>): boolean;
	/** Check if an event.data is a plugin message is an handshake */
	export function isPluginMessage(message: any): message is Message;
	/**
	 * Connect a plugin to the engine for a specific connector
	 * @param connector The connector for this plugin
	 * @param client The client instance of the plugin
	 * @example With a client
	 * typescript
	 * const client = new PluginClient()
	 * connectClient(new IframeConnector(client), client);
	 * 
	 */
	export function connectClient(connector: ClientConnector, client?: PluginClient): PluginClient<any, Readonly<IRemixApi>>;
	export type Client<P extends Api, A extends ApiMap> = PluginApi<A> & PluginClient<P, A>;
	/**
	 * Add shortcut to the api requested by the client on it.
	 * @description
	 * Once applied, the client can do client.solidity.compile(x) instead of client.call('solidity', 'compile', x)
	 * @param client The client on which we apply the api
	 */
	export function applyApi(client: PluginClient): void;
	/**
	 * Create & connect a client with a connector.
	 * @param connector A communication layer connector
	 * @param client The plugin client
	 */
	export const createConnectorClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(connector: ClientConnector, client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'dist/packages/plugin/core/lib/node' {
	import { PluginClient } from 'dist/packages/plugin/core/lib/client';
	/**
	 * Access a service of an external plugin
	 */
	export class PluginNode {
	    private path;
	    private client;
	    /**
	     * @param path Path to external plugin
	     * @param client The main client used in this plugin
	     */
	    constructor(path: string, client: PluginClient);
	    get(name: string): PluginNode;
	    /** Call a method of the node */
	    call(method: string, ...payload: any[]): Promise<any>;
	    /**
	     * Listen to an event from the plugin
	     * @note Event are trigger at the root level yet, not on a specific node
	     */
	    on(method: string, cb: Function): void;
	}

}
declare module 'dist/packages/plugin/core/lib/origin' {
	import { PluginOptions } from 'dist/packages/plugin/core/lib/client';
	export const remixOrgins = "https://gist.githubusercontent.com/EthereumRemix/091ccc57986452bbb33f57abfb13d173/raw/3367e019335746b73288e3710af2922d4c8ef5a3/origins.json";
	/** Fetch the default origins for remix */
	export function getOriginsFromUrl(url: string): Promise<any>;
	export function getDevmodeOrigins({ devMode }: Partial<PluginOptions<any>>): string[];
	/**
	 * Check if the sender has the right origin
	 * @param origin The origin of the incoming message
	 * @param options client plugin options
	 */
	export function checkOrigin(origin: string, options?: Partial<PluginOptions<any>>): Promise<boolean>;

}
declare module 'dist/packages/plugin/core/index' {
	export * from 'dist/packages/plugin/core/lib/api';
	export * from 'dist/packages/plugin/core/lib/client';
	export * from 'dist/packages/plugin/core/lib/connector';
	export * from 'dist/packages/plugin/core/lib/node';
	export * from 'dist/packages/plugin/core/lib/origin';

}
declare module 'dist/packages/plugin/iframe/lib/connector' {
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	import { ClientConnector, Client, PluginClient, PluginOptions } from '@remixproject/plugin';
	export class IframeConnector implements ClientConnector {
	    private options;
	    source: Window;
	    origin: string;
	    constructor(options: PluginOptions<any>);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect an Iframe client to a web engine
	 * @param client An optional iframe client to connect to the engine
	 * @example Let the function create a client
	 * typescript
	 * const client = createClient()
	 * 
	 * @example With a custom client
	 * typescript
	 * class MyPlugin extends PluginClient {
	 *  methods = ['hello']
	 *  hello() {
	 *   console.log('Hello World')
	 *  }
	 * }
	 * const client = createClient(new MyPlugin())
	 * 
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'dist/packages/plugin/iframe/lib/theme' {
	import { PluginClient, PluginOptions } from '@remixproject/plugin';
	/** Start listening on theme changed */
	export function listenOnThemeChanged(client: PluginClient, options?: Partial<PluginOptions<any>>): Promise<HTMLLinkElement>;

}
declare module 'dist/packages/plugin/iframe/index' {
	export * from 'dist/packages/plugin/iframe/lib/connector';
	export * from 'dist/packages/plugin/iframe/lib/theme';

}
declare module 'dist/packages/plugin/vscode/lib/webview' {
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { ClientConnector, Client, PluginClient, PluginOptions } from '@remixproject/plugin';
	/**
	 * This Webview connector
	 */
	export class WebviewConnector implements ClientConnector {
	    private options;
	    source: {
	        postMessage: (message: any, origin?: string) => void;
	    };
	    origin: string;
	    isVscode: boolean;
	    constructor(options?: Partial<PluginOptions<any>>);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Webview plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>>>(client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'dist/packages/plugin/vscode/lib/extension' {
	export {};

}
declare module 'dist/packages/plugin/vscode/index' {
	export * from 'dist/packages/plugin/vscode/lib/webview';
	export * from 'dist/packages/plugin/vscode/lib/extension';

}
declare module 'dist/packages/plugin/webview/lib/connector' {
	import type { Message, Api, PluginApi } from '@remixproject/plugin-utils';
	import { ClientConnector, PluginClient, PluginOptions } from '@remixproject/plugin';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile'; global {
	    function acquireTheiaApi(): any;
	}
	/**
	 * This Webview connector
	 */
	export class WebviewConnector implements ClientConnector {
	    private options;
	    source: {
	        postMessage: (message: any, origin?: string) => void;
	    };
	    origin: string;
	    isVscode: boolean;
	    constructor(options: PluginOptions<any>);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	    forwardEvents(): void;
	}
	/**
	 * Connect a Webview plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 */
	export const createClient: <P extends Api = any, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>, C extends PluginClient<P, App> = any>(client: C) => C & PluginApi<App>;

}
declare module 'dist/packages/plugin/webview/index' {
	export * from 'dist/packages/plugin/webview/lib/connector';

}
declare module 'dist/packages/plugin/webworker/lib/connector' {
	/// <reference lib="webworker" />
	import { ClientConnector, Client, PluginClient } from '@remixproject/plugin';
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	export class WebworkerConnector implements ClientConnector {
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get message from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Websocket plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'dist/packages/plugin/webworker/index' {
	export * from 'dist/packages/plugin/webworker/lib/connector';

}
declare module 'dist/packages/plugin/ws/lib/ws' {
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { PluginClient, ClientConnector, Client } from '@remixproject/plugin';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	export interface WS {
	    send(data: string): void;
	    on(type: 'message', cb: (event: string) => any): this;
	}
	/**
	 * This Websocket connector works with the library ws
	 */
	export class WebsocketConnector implements ClientConnector {
	    private websocket;
	    account: string;
	    constructor(websocket: WS);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get message from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Websocket plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 *
	 * ---------
	 * @example
	 * typescript
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws)
	 * })
	 * 
	 * ---------
	 * @example
	 * typescript
	 * class MyPlugin extends PluginClient {
	 *  methods = ['hello']
	 *  hello() {
	 *   console.log('Hello World')
	 *  }
	 * }
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws, new MyPlugin())
	 * })
	 * 
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(websocket: WS, client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'dist/packages/plugin/ws/index' {
	export * from 'dist/packages/plugin/ws/lib/ws';

}
declare module 'dist/packages/utils/lib/tools/event-name' {
	/** Create the name of the event for a call */
	export function callEvent(name: string, key: string, id: number): string;
	/** Create the name of the event for a listen */
	export function listenEvent(name: string, key: string): string;

}
declare module 'dist/packages/utils/lib/tools/method-path' {
	/** Create a method path based on the method name and the path */
	export function getMethodPath(method: string, path?: string): string;
	/** Get the root name of a path */
	export function getRootPath(path: string): string;

}
declare module 'dist/packages/utils/lib/types/service' {
	export type IPluginService<T extends Record<string, any> = any> = {
	    methods: string[];
	    readonly path: string;
	} & T;
	export type GetPluginService<S extends Record<string, any>> = S extends IPluginService<infer I> ? S : IPluginService<S>;

}
declare module 'dist/packages/utils/lib/types/status' {
	export interface Status {
	    /** Display an icon or number */
	    key: number | 'edited' | 'succeed' | 'loading' | 'failed' | 'none';
	    /** Bootstrap css color */
	    type?: 'success' | 'info' | 'warning' | 'error';
	    /** Describe the status on mouseover */
	    title?: string;
	}
	export type StatusEvents = {
	    statusChanged: (status: Status) => void;
	};

}
declare module 'dist/packages/utils/lib/types/api' {
	import { StatusEvents } from 'dist/packages/utils/lib/types/status';
	export interface Api {
	    events: {
	        [key: string]: (...args: any[]) => void;
	    } & StatusEvents;
	    methods: {
	        [key: string]: (...args: any[]) => void;
	    };
	}
	export type EventKey<T extends Api> = Extract<keyof T['events'], string>;
	export type EventParams<T extends Api, K extends EventKey<T>> = T extends Api ? Parameters<T['events'][K]> : any[];
	export type EventCallback<T extends Api, K extends EventKey<T>> = T extends Api ? T['events'][K] : (...payload: any[]) => void;
	export type MethodKey<T extends Api> = Extract<keyof T['methods'], string>;
	export type MethodParams<T extends Api, K extends MethodKey<T>> = T extends Api ? Parameters<T['methods'][K]> : any[];
	export interface EventApi<T extends Api> {
	    on: <event extends EventKey<T>>(name: event, cb: T['events'][event]) => void;
	}
	export type MethodApi<T extends Api> = {
	    [m in Extract<keyof T['methods'], string>]: (...args: Parameters<T['methods'][m]>) => Promise<ReturnType<T['methods'][m]>>;
	};
	export type CustomApi<T extends Api> = EventApi<T> & MethodApi<T>;
	/** A map of Api used to describe all the plugin's api in the project */
	export type ApiMap = Readonly<Record<string, Api>>;
	/** A map of plugin based on the ApiMap. It enforces the PluginEngine */
	export type PluginApi<T extends ApiMap> = {
	    [name in keyof T]: CustomApi<T[name]>;
	};
	export type API<T extends Api> = {
	    [M in keyof T['methods']]: T['methods'][M] | Promise<T['methods'][M]>;
	};

}
declare module 'dist/packages/utils/lib/types/plugin' {
	import type { IPluginService } from 'dist/packages/utils/lib/types/service';
	import { EventCallback, MethodParams, MethodKey, EventKey, Api, ApiMap, EventParams } from 'dist/packages/utils/lib/types/api';
	export interface PluginBase<T extends Api = any, App extends ApiMap = any> {
	    methods: string[];
	    activateService: Record<string, () => Promise<IPluginService>>;
	    /** Listen on an event from another plugin */
	    on<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Listen one time on an event from another plugin, then remove event listener */
	    once<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key, cb: EventCallback<App[Name], Key>): void;
	    /** Stop listening on an event from another plugin */
	    off<Name extends Extract<keyof App, string>, Key extends EventKey<App[Name]>>(name: Name, key: Key): void;
	    /** Call a method of another plugin */
	    call<Name extends Extract<keyof App, string>, Key extends MethodKey<App[Name]>>(name: Name, key: Key, ...payload: MethodParams<App[Name], Key>): Promise<any>;
	    /** Emit an event */
	    emit<Key extends EventKey<T>>(key: Key, ...payload: EventParams<T, Key>): void;
	}
	export { EventCallback, MethodParams, MethodKey, EventKey, Api, ApiMap, EventParams }
}
declare module 'dist/packages/utils/lib/tools/service' {
	import type { IPluginService, GetPluginService } from 'dist/packages/utils/lib/types/service';
	import type { Api, ApiMap } from 'dist/packages/utils/lib/types/api';
	import type { PluginBase } from 'dist/packages/utils/lib/types/plugin';
	/** Check if the plugin is an instance of PluginService */
	export const isPluginService: (service: any) => service is PluginService;
	/**
	 * Return the methods of a service, except "constructor" and methods starting with "_"
	 * @param instance The instance of a class to get the method from
	 */
	export function getMethods(service: IPluginService): any;
	/**
	 * Create a plugin service
	 * @param path The path of the service separated by '.' (ex: 'box.profile')
	 * @param service The service template
	 * @note If the service doesn't provide a property "methods" then all methods are going to be exposed by default
	 */
	export function createService<T extends Record<string, any>>(path: string, service: T): GetPluginService<T>;
	/**
	 * Connect the service to the plugin client
	 * @param client The main client of the plugin
	 * @param service A service to activate
	 */
	export function activateService<T extends Api = any, App extends ApiMap = any>(client: PluginBase<T, App>, service: IPluginService): any;
	/**
	 * A node that forward the call to the right path
	 */
	export abstract class PluginService implements IPluginService {
	    methods: string[];
	    abstract readonly path: string;
	    protected abstract plugin: PluginBase;
	    emit(key: string, ...payload: any[]): void;
	    /**
	     * Create a subservice under this service
	     * @param name The name of the subservice inside this service
	     * @param service The subservice to add
	     */
	    createService<S extends Record<string, any>>(name: string, service: S): Promise<GetPluginService<S>>;
	    /**
	     * Prepare a service to be lazy loaded.
	     * Service can be activated by doing client.activateService(path)
	     * @param name The name of the subservice inside this service
	     * @param factory A function to create the service on demand
	     */
	    prepareService<S extends Record<string, any>>(name: string, factory: () => S): void;
	}

}
declare module 'dist/packages/utils/lib/types/message' {
	export interface PluginRequest {
	    /** The name of the plugin making the request */
	    from: string;
	    /** @deprecated Will be remove in the next version */
	    isFromNative?: boolean;
	    /**
	     * The path to access the request inside the plugin
	     * @example 'remixd.cmd.git'
	     */
	    path?: string;
	} type MessageActions = 'on' | 'off' | 'once' | 'call' | 'response' | 'emit'; type OldMessageActions = 'notification' | 'request' | 'response' | 'listen';
	export interface Message {
	    id: number;
	    action: MessageActions | OldMessageActions;
	    name: string;
	    key: string;
	    payload: any;
	    requestInfo: PluginRequest;
	    error?: Error | string;
	    signature?: string;
	    verifier?: string;
	}
	export {};

}
declare module 'dist/packages/utils/lib/types/profile' {
	import { MethodKey, Api, ApiMap, EventKey } from 'dist/packages/utils/lib/types/api';
	/** Describe a plugin */
	export interface Profile<T extends Api = any> {
	    name: string;
	    displayName?: string;
	    methods?: MethodKey<T>[];
	    permission?: boolean;
	    hash?: string;
	    description?: string;
	    documentation?: string;
	    version?: string;
	}
	export interface LocationProfile {
	    location: string;
	}
	export interface ExternalProfile {
	    url: string;
	}
	export interface HostProfile extends Profile {
	    methods: ('addView' | 'removeView' | 'focus' | string)[];
	}
	export interface LibraryProfile<T extends Api = any> extends Profile<T> {
	    events?: EventKey<T>[];
	    notifications?: {
	        [name: string]: string[];
	    };
	}
	/** A map of profile */
	export type ProfileMap<T extends ApiMap> = Partial<{
	    [name in keyof T]: Profile<T[name]>;
	}>;
	/** Extract the API of a profile */
	export type ApiFromProfile<T> = T extends Profile<infer I> ? I : never;
	/** Create an ApiMap from a Profile Map */
	export type ApiMapFromProfileMap<T extends ProfileMap<any>> = {
	    [name in keyof T]: ApiFromProfile<T[name]>;
	};
	/** Transform an ApiMap into a profile map */
	export type ProfileMapFromApiMap<T extends ApiMap> = Readonly<{
	    [name in keyof T]: Profile<T[name]>;
	}>;

}
declare module 'dist/packages/utils/index' {
	export * from 'dist/packages/utils/lib/tools/event-name';
	export * from 'dist/packages/utils/lib/tools/method-path';
	export * from 'dist/packages/utils/lib/tools/service';
	export * from 'dist/packages/utils/lib/types/api';
	export * from 'dist/packages/utils/lib/types/message';
	export * from 'dist/packages/utils/lib/types/plugin';
	export * from 'dist/packages/utils/lib/types/profile';
	export * from 'dist/packages/utils/lib/types/service';
	export * from 'dist/packages/utils/lib/types/status';

}
declare module 'examples/example/engine/web/src/app/engine' {
	import { Engine as PluginEngine } from '@remixproject/engine';
	export class Engine extends PluginEngine {
	    constructor();
	}

}
declare module 'examples/example/engine/web/src/app/plugins/manager' {
	import { PluginManager } from '@remixproject/engine';
	import { Profile } from '@remixproject/plugin-utils';
	import { Engine } from 'examples/example/engine/web/src/app/engine';
	export class Manager extends PluginManager {
	    private activeProfiles;
	    private idleProfiles;
	    activeProfiles$: import("rxjs").Observable<Profile<any>[]>;
	    idleProfiles$: import("rxjs").Observable<Profile<any>[]>;
	    constructor(engine: Engine);
	    private updateProfiles;
	    onProfileAdded(): void;
	    onPluginActivated(profile: Profile): void;
	    onPluginDeactivated(): void;
	    canDeactivatePlugin(from: Profile, to: Profile): Promise<boolean>;
	}

}
declare module 'examples/example/engine/web/src/app/plugins/theme' {
	import { ThemePlugin } from '@remixproject/engine-web';
	import { Engine } from 'examples/example/engine/web/src/app/engine';
	export class Theme extends ThemePlugin {
	    private engine;
	    private themes;
	    constructor(engine: Engine);
	    selectTheme(brightness: 'dark' | 'light'): void;
	    onActivation(): void;
	}

}
declare module 'examples/example/engine/web/src/app/plugins/window' {
	import { WindowPlugin } from '@remixproject/engine-web';
	import { Engine } from 'examples/example/engine/web/src/app/engine';
	import { Theme } from 'examples/example/engine/web/src/app/plugins/theme';
	export class Window extends WindowPlugin {
	    private engine;
	    private theme;
	    constructor(engine: Engine, theme: Theme);
	    onActivation(): Promise<void>;
	}

}
declare module 'examples/example/engine/web/src/app/plugins/library' {
	/// <reference types="node" />
	import { LibraryPlugin } from '@remixproject/engine';
	import { EventEmitter } from 'events';
	import { Engine } from 'examples/example/engine/web/src/app/engine';
	interface Transaction {
	    id: string;
	} class TransactionLibrary {
	    private transactions;
	    events: EventEmitter;
	    sendTransaction(tx: Transaction): void;
	}
	export class Library extends LibraryPlugin {
	    library: TransactionLibrary;
	    constructor(engine: Engine);
	    onActivation(): void;
	}
	export {};

}
declare module 'examples/example/engine/web/src/app/plugins/terminal' {
	import { Plugin } from '@remixproject/engine';
	import { Engine } from 'examples/example/engine/web/src/app/engine';
	export class Terminal extends Plugin {
	    private engine;
	    constructor(engine: Engine);
	    onActivation(): void;
	    run(text: string): void;
	}

}
declare module 'examples/example/engine/web/src/app/plugins/index' {
	export * from 'examples/example/engine/web/src/app/plugins/manager';
	export * from 'examples/example/engine/web/src/app/plugins/theme';
	export * from 'examples/example/engine/web/src/app/plugins/window';
	export * from 'examples/example/engine/web/src/app/plugins/library';
	export * from 'examples/example/engine/web/src/app/plugins/terminal';

}
declare module 'examples/example/engine/web/src/app/app.component' {
	import { Theme, Manager, Window, Library } from 'examples/example/engine/web/src/app/plugins';
	import { Engine } from 'examples/example/engine/web/src/app/engine';
	export class AppComponent {
	    private engine;
	    private manager;
	    private window;
	    private theme;
	    private library;
	    actives$: import("rxjs").Observable<import("../../../../../../packages/utils/src").Profile<any>[]>;
	    idles$: import("rxjs").Observable<import("../../../../../../packages/utils/src").Profile<any>[]>;
	    constructor(engine: Engine, manager: Manager, window: Window, theme: Theme, library: Library);
	    ngAfterViewInit(): void;
	    deactivate(name: string): void;
	    activate(name: string): void;
	}

}
declare module 'examples/example/engine/web/src/app/host.directive' {
	import { ElementRef, Renderer2 } from '@angular/core';
	import { Manager } from 'examples/example/engine/web/src/app/plugins';
	import { Engine } from 'examples/example/engine/web/src/app/engine';
	export class HostDirective {
	    private engine;
	    private manager;
	    private el;
	    private renderer;
	    private plugin;
	    host: string;
	    constructor(engine: Engine, manager: Manager, el: ElementRef, renderer: Renderer2);
	    get name(): string;
	    ngAfterViewInit(): void;
	    ngOnDestroy(): Promise<void>;
	}

}
declare module 'examples/example/engine/web/src/app/terminal/terminal.component' {
	import { FormControl } from '@angular/forms';
	import { Manager, Terminal } from 'examples/example/engine/web/src/app/plugins';
	export class TerminalComponent {
	    private manager;
	    private terminal;
	    form: FormControl;
	    constructor(manager: Manager, terminal: Terminal);
	    submit(): Promise<void>;
	}

}
declare module 'examples/example/engine/web/src/app/app.module' {
	export class AppModule {
	}

}
declare module 'examples/example/engine/web/src/environments/environment' {
	export const environment: {
	    production: boolean;
	};

}
declare module 'examples/example/engine/web/src/main' {
	export {};

}
declare module 'examples/example/engine/web/src/polyfills' {
	/**
	 * This file includes polyfills needed by Angular and is loaded before the app.
	 * You can add your own extra polyfills to this file.
	 *
	 * This file is divided into 2 sections:
	 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
	 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
	 *      file.
	 *
	 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
	 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
	 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
	 *
	 * Learn more in https://angular.io/guide/browser-support
	 */
	/***************************************************************************************************
	 * BROWSER POLYFILLS
	 */
	/** IE10 and IE11 requires the following for NgClass support on SVG elements */
	/**
	 * Web Animations @angular/platform-browser/animations
	 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
	 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
	 */
	/**
	 * By default, zone.js will patch all possible macroTask and DomEvents
	 * user can disable parts of macroTask/DomEvents patch by setting following flags
	 * because those flags need to be set before zone.js being loaded, and webpack
	 * will put import in the top of bundle, so user need to create a separate file
	 * in this directory (for example: zone-flags.ts), and put the following flags
	 * into that file, and then add the following code before importing zone.js.
	 * import './zone-flags';
	 *
	 * The flags allowed in zone-flags.ts are listed here.
	 *
	 * The following flags will work for all browsers.
	 *
	 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
	 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
	 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
	 *
	 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
	 *  with the following flag, it will bypass zone.js patch for IE/Edge
	 *
	 *  (window as any).__Zone_enable_cross_context_check = true;
	 *
	 */
	/***************************************************************************************************
	 * Zone JS is required by default for Angular itself.
	 */
	import 'zone.js/dist/zone';
	/***************************************************************************************************
	 * APPLICATION IMPORTS
	 */

}
declare module 'examples/example/engine/web/src/test-setup' {
	import 'jest-preset-angular';

}
declare module 'examples/example/engine/web/src/environments/environment.prod' {
	export const environment: {
	    production: boolean;
	};

}
declare module 'examples/example/engine/web-e2e/src/support/app.po' {
	export const pluginList: () => any;

}
declare module 'examples/example/engine/web-e2e/src/integration/app.spec' {
	export {};

}
declare namespace Cypress {
    interface Chainable<Subject> {
        login(email: string, password: string): void;
    }
}
declare module 'examples/example/engine/web-e2e/src/support/index' {
	import 'examples/example/engine/web-e2e/src/support/commands';

}
declare module 'examples/example/plugin/webview/src/app/client' {
	import { InjectionToken } from '@angular/core';
	import { PluginClient } from '@remixproject/plugin';
	export class Client extends PluginClient {
	    methods: string[];
	    constructor();
	    execute(value: string): void;
	    onActivation(): void;
	}
	export const CLIENT: InjectionToken<Client>;

}
declare module 'examples/example/plugin/webview/src/app/app.component' {
	import { Client } from 'examples/example/plugin/webview/src/app/client';
	export class AppComponent {
	    private client;
	    title: string;
	    constructor(client: Client);
	}

}
declare module 'examples/example/plugin/webview/src/app/app.module' {
	export class AppModule {
	}

}
declare module 'examples/example/plugin/webview/src/environments/environment' {
	export const environment: {
	    production: boolean;
	};

}
declare module 'examples/example/plugin/webview/src/main' {
	export {};

}
declare module 'examples/example/plugin/webview/src/polyfills' {
	/**
	 * This file includes polyfills needed by Angular and is loaded before the app.
	 * You can add your own extra polyfills to this file.
	 *
	 * This file is divided into 2 sections:
	 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
	 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
	 *      file.
	 *
	 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
	 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
	 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
	 *
	 * Learn more in https://angular.io/guide/browser-support
	 */
	/***************************************************************************************************
	 * BROWSER POLYFILLS
	 */
	/** IE10 and IE11 requires the following for NgClass support on SVG elements */
	/**
	 * Web Animations @angular/platform-browser/animations
	 * Only required if AnimationBuilder is used within the application and using IE/Edge or Safari.
	 * Standard animation support in Angular DOES NOT require any polyfills (as of Angular 6.0).
	 */
	/**
	 * By default, zone.js will patch all possible macroTask and DomEvents
	 * user can disable parts of macroTask/DomEvents patch by setting following flags
	 * because those flags need to be set before zone.js being loaded, and webpack
	 * will put import in the top of bundle, so user need to create a separate file
	 * in this directory (for example: zone-flags.ts), and put the following flags
	 * into that file, and then add the following code before importing zone.js.
	 * import './zone-flags';
	 *
	 * The flags allowed in zone-flags.ts are listed here.
	 *
	 * The following flags will work for all browsers.
	 *
	 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
	 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
	 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
	 *
	 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
	 *  with the following flag, it will bypass zone.js patch for IE/Edge
	 *
	 *  (window as any).__Zone_enable_cross_context_check = true;
	 *
	 */
	/***************************************************************************************************
	 * Zone JS is required by default for Angular itself.
	 */
	import 'zone.js/dist/zone';
	/***************************************************************************************************
	 * APPLICATION IMPORTS
	 */

}
declare module 'examples/example/plugin/webview/src/test-setup' {
	import 'jest-preset-angular';

}
declare module 'examples/example/plugin/webview/src/environments/environment.prod' {
	export const environment: {
	    production: boolean;
	};

}
declare module 'examples/example/plugin/webview-e2e/src/support/app.po' {
	export const getGreeting: () => any;

}
declare module 'examples/example/plugin/webview-e2e/src/integration/app.spec' {
	export {};

}
declare namespace Cypress {
    interface Chainable<Subject> {
        login(email: string, password: string): void;
    }
}
declare module 'examples/example/plugin/webview-e2e/src/support/index' {
	import 'examples/example/plugin/webview-e2e/src/support/commands';

}
declare module 'packages/engine/core/tests/abstract.spec' {
	export {};

}
declare module 'packages/engine/core/tests/connector.spec' {
	export {};

}
declare module 'packages/engine/core/tests/engine.spec' {
	/// <reference types="jest" />
	import { Engine, Plugin, PluginManager } from 'packages/engine/core/src';
	export class MockEngine extends Engine {
	    onRegistration: jest.Mock<any, any>;
	    setPluginOption: jest.Mock<{
	        queueTimeout: number;
	    }, []>;
	}
	export class MockManager extends PluginManager {
	    activatePlugin: jest.Mock<Promise<unknown>, [names: string | string[]]>;
	    deactivatePlugin: jest.Mock<Promise<unknown>, [names: string | string[]]>;
	    onRegistration: jest.Mock<any, any>;
	    onActivation: jest.Mock<any, any>;
	    onDeactivation: jest.Mock<any, any>;
	    onPluginActivated: jest.Mock<any, any>;
	    onPluginDeactivated: jest.Mock<any, any>;
	    onProfileAdded: jest.Mock<any, any>;
	    canActivatePlugin: jest.Mock<Promise<boolean>, []>;
	    canDeactivatePlugin: jest.Mock<Promise<boolean>, [from: any]>;
	    canCall: jest.Mock<Promise<boolean>, []>;
	    constructor();
	}
	export class MockSolidity extends Plugin {
	    onActivation: jest.Mock<any, any>;
	    onDeactivation: jest.Mock<any, any>;
	    onRegistration: jest.Mock<any, any>;
	    compile: jest.Mock<any, any>;
	    slowMockMethod: jest.Mock<Promise<unknown>, [num: number]>;
	    getCompilationResult: jest.Mock<any, any>;
	    constructor();
	}
	export class MockFileManager extends Plugin {
	    private files;
	    private active;
	    constructor();
	    getCurrentFile: jest.Mock<string, []>;
	    getFile: jest.Mock<string, [path: string]>;
	    getFolder: jest.Mock<{}, []>;
	    setFile: jest.Mock<string, [path: string, content: string]>;
	    switchFile: jest.Mock<void, [path: string]>;
	}

}
declare module 'packages/engine/core/tests/manager.spec' {
	export {};

}
declare module 'packages/engine/node/src/lib/child-process' {
	/// <reference types="node" />
	import type { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils';
	import { PluginConnector } from '@remixproject/engine';
	import { ChildProcess } from 'child_process';
	export class ChildProcessPlugin extends PluginConnector {
	    private readonly listener;
	    process: ChildProcess;
	    constructor(profile: Profile & ExternalProfile);
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): void;
	    protected disconnect(): void;
	}

}
declare module 'packages/engine/node/src/index' {
	export * from 'packages/engine/node/src/lib/child-process';

}
declare module 'packages/engine/node/tests/child-process.spec' {
	export {};

}
declare module 'packages/engine/theia/src/lib/engine-theia' {
	export function engineTheia(): string;

}
declare module 'packages/engine/theia/src/index' {
	export * from 'packages/engine/theia/src/lib/engine-theia';

}
declare module 'packages/engine/theia/src/lib/engine-theia.spec' {
	export {};

}
declare module 'packages/engine/vscode/src/lib/command' {
	import { Plugin } from '@remixproject/engine';
	import { Profile, PluginOptions } from '@remixproject/plugin-utils';
	import { Disposable } from 'vscode';
	export const transformCmd: (name: string, method: string) => string;
	export interface CommandOptions extends PluginOptions {
	    transformCmd: (name: string, method: string) => string;
	}
	/**
	 * Connect methods of the plugins with a command depending on the transformCmd function pass as option
	 */
	export class CommandPlugin extends Plugin {
	    subscriptions: Disposable[];
	    options: CommandOptions;
	    constructor(profile: Profile);
	    setOptions(options: Partial<CommandOptions>): void;
	    activate(): void;
	    deactivate(): void;
	}

}
declare module 'packages/engine/vscode/src/lib/dynamic-list' {
	import { Plugin } from '@remixproject/engine';
	import { PluginOptions } from '@remixproject/plugin-utils';
	import { TreeDataProvider, EventEmitter, TreeView, TreeItem } from 'vscode'; type ID = string | number;
	export class Item<I> extends TreeItem {
	    private item;
	    constructor(label: string, pluginName: string, item: I);
	}
	export class List<I> implements TreeDataProvider<I> {
	    private name;
	    private list;
	    private options;
	    render: EventEmitter<I>;
	    onDidChangeTreeData: import("vscode").Event<I>;
	    constructor(name: string, initial?: I[]);
	    setOptions(options: Partial<ListOptions>): void;
	    reset(list: I[]): void;
	    getParent(): any;
	    getTreeItem(element: I): Item<I>;
	    getChildren(): I[];
	}
	export interface ListOptions {
	    idKey: string;
	    labelKey: string;
	}
	export type ListPluginOptions = PluginOptions & ListOptions;
	export class DynamicListPlugin<I, T extends List<I> = List<I>> extends Plugin {
	    private listeners;
	    protected options: ListPluginOptions;
	    protected treeView: TreeView<I>;
	    protected entities: Record<string, I>;
	    protected selected: ID;
	    list: T;
	    constructor(name: string, options?: Partial<ListPluginOptions>);
	    setOptions(options: Partial<ListPluginOptions>): void;
	    activate(): void;
	    deactivate(): void;
	    getIds(): string[];
	    getItem(id: ID): I;
	    getAll(): I[];
	    /** Select on element of the list */
	    select(idOrItem: ID | I): void;
	    /** Reset the entire list */
	    reset(items: I[]): void;
	    /** Add a new item to the list */
	    add(item: I): void;
	    /** Remove one item from the list */
	    remove(id: ID): void;
	    /** Update one item in the list */
	    update(id: ID, item: Partial<I>): void;
	}
	export {};

}
declare module 'packages/engine/vscode/src/lib/extension' {
	import { PluginConnector } from '@remixproject/engine';
	import { Profile, ExternalProfile, Message } from '@remixproject/plugin-utils';
	export class ExtensionPlugin extends PluginConnector {
	    private extension;
	    private connector;
	    constructor(profile: Profile & ExternalProfile);
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): Promise<void>;
	    protected disconnect(): void;
	}

}
declare module 'packages/engine/vscode/src/lib/theme' {
	import { Plugin } from '@remixproject/engine';
	import { API, PluginOptions } from '@remixproject/plugin-utils';
	import { ITheme, Theme, ThemeUrls } from '@remixproject/plugin-api';
	import { Disposable, ColorTheme } from 'vscode';
	export interface ThemeOptions extends PluginOptions {
	    urls?: Partial<ThemeUrls>;
	}
	export function getVscodeTheme(color: ColorTheme, urls?: Partial<ThemeUrls>): Theme;
	export class ThemePlugin extends Plugin implements API<ITheme> {
	    protected getTheme: typeof getVscodeTheme;
	    protected options: ThemeOptions;
	    listener: Disposable;
	    constructor(options?: Partial<ThemeOptions>);
	    setOptions(options: Partial<ThemeOptions>): void;
	    onActivation(): void;
	    onDeactivation(): void;
	    currentTheme(): Theme;
	}

}
declare module 'packages/engine/vscode/src/lib/webview' {
	import { PluginConnector, PluginConnectorOptions } from '@remixproject/engine';
	import { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils';
	import { ExtensionContext, ViewColumn, WebviewPanel } from 'vscode';
	interface WebviewOptions extends PluginConnectorOptions {
	    /** Extension Path */
	    context: ExtensionContext;
	    relativeTo?: 'workspace' | 'extension';
	    column?: ViewColumn;
	    devMode?: boolean;
	}
	export class WebviewPlugin extends PluginConnector {
	    private listeners;
	    panel?: WebviewPanel;
	    options: WebviewOptions;
	    constructor(profile: Profile & ExternalProfile, options: WebviewOptions);
	    setOptions(options: Partial<WebviewOptions>): void;
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): Promise<void>;
	    getMessage(message: Message): Promise<void>;
	    protected disconnect(): void;
	}
	/** Create a webview */
	export function createWebview(profile: Profile, url: string, options: WebviewOptions): Promise<WebviewPanel>;
	export {};

}
declare module 'packages/engine/vscode/src/lib/window' {
	import { Plugin } from '@remixproject/engine';
	import { Profile, PluginOptions } from '@remixproject/plugin-utils';
	import { QuickPickOptions, InputBoxOptions } from 'vscode';
	export const windowProfile: Profile;
	interface IWindowPlugin {
	    /** Display an input window */
	    prompt(): Thenable<string>;
	    /** Display a select window */
	    select(options: string[]): Thenable<string>;
	    /** Display a select window with local file system: can only select a file */
	    selectFile(): Thenable<string>;
	    /** Display a select window with local file system: can only select a folder */
	    selectFolder(): Thenable<string>;
	    /** Display a message with actions button. Returned the button clicked if any */
	    alert(message: string, actions?: string[]): Thenable<string>;
	    /** Display a warning message with actions button. Returned the button clicked if any */
	    warning(message: string, actions?: string[]): Thenable<string>;
	    /** Display an error message with actions button. Returned the button clicked if any */
	    error(message: string, actions?: string[]): Thenable<string>;
	}
	export class WindowPlugin extends Plugin implements IWindowPlugin {
	    constructor(options?: PluginOptions);
	    prompt(options?: InputBoxOptions): Thenable<string>;
	    select(items: string[], options?: QuickPickOptions): Thenable<string>;
	    selectFile(): Thenable<string>;
	    selectFolder(): Thenable<string>;
	    alert(message: string, actions?: string[]): Thenable<string>;
	    error(message: string, actions?: string[]): Thenable<string>;
	    warning(message: string, actions?: string[]): Thenable<string>;
	}
	export {};

}
declare module 'packages/engine/vscode/src/util/path' {
	export function absolutePath(path: string): string;
	export function relativePath(path: any): any;

}
declare module 'packages/engine/vscode/src/util/editor' {
	import { TextEditor } from 'vscode';
	export function getOpenedTextEditor(): TextEditor;
	export function getTextEditorWithDocumentType(type: string): TextEditor;

}
declare module 'packages/engine/vscode/src/lib/filemanager' {
	import { IFileSystem } from '@remixproject/plugin-api';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { CommandPlugin } from 'packages/engine/vscode/src/lib/command';
	export class FileManagerPlugin extends CommandPlugin implements MethodApi<IFileSystem> {
	    constructor();
	    /** Open the content of the file in the context (eg: Editor) */
	    open(path: string): Promise<void>;
	    /** Set the content of a specific file */
	    writeFile(path: string, data: string): Promise<void>;
	    /** Return the content of a specific file */
	    readFile(path: string): Promise<string>;
	    /** Remove a file */
	    remove(path: string): Promise<void>;
	    /** Change the path of a file */
	    rename(oldPath: string, newPath: string): Promise<void>;
	    /** Upsert a file with the content of the source file */
	    copyFile(src: string, dest: string): Promise<void>;
	    /** Create a directory */
	    mkdir(path: string): Promise<void>;
	    /** Get the list of files in the directory */
	    readdir(path: string): Promise<string[]>;
	    getCurrentFile(): Promise<any>;
	    closeFile(): Promise<any>;
	    closeAllFiles(): Promise<any>;
	    logMessage(message: any): void;
	    getFile: (path: string) => Promise<string>;
	    setFile: (path: string, data: string) => Promise<void>;
	    switchFile: (path: string) => Promise<void>;
	    /** @deprecated Use readdir instead */
	    getFolder(path: string): Promise<any>;
	}

}
declare module 'packages/engine/vscode/src/lib/editor' {
	import { IEditor, Annotation, HighlightPosition } from '@remixproject/plugin-api';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { CommandPlugin, CommandOptions } from 'packages/engine/vscode/src/lib/command';
	export interface EditorOptions extends CommandOptions {
	    language: string;
	}
	export class EditorPlugin extends CommandPlugin implements MethodApi<IEditor> {
	    private decoration;
	    private decorations;
	    private diagnosticCollection;
	    options: EditorOptions;
	    constructor(options: EditorOptions);
	    setOptions(options: EditorOptions): void;
	    onActivation(): void;
	    onDeactivation(): void;
	    highlight(position: HighlightPosition, filePath: string, themeColor: string): Promise<void>;
	    discardDecorations(): Promise<void>;
	    discardHighlight(): Promise<void>;
	    /**
	     * Alisas of  discardHighlight
	     * Required to match the standard interface of editor
	     */
	    discardHighlightAt(): Promise<void>;
	    addAnnotation(annotation: Annotation, filePath?: string): Promise<void>;
	    clearAnnotations(): Promise<void>;
	    gotoLine(line: number, col: number): Promise<void>;
	}

}
declare module 'packages/engine/vscode/src/lib/terminal' {
	import { Plugin } from '@remixproject/engine';
	export interface TerminalOptions {
	    name?: string;
	    open: boolean;
	}
	export class TerminalPlugin extends Plugin {
	    private terminals;
	    private outputs;
	    private activeOutput;
	    constructor();
	    onDeactivation(): void;
	    private get active();
	    private getTerminal;
	    private getOutput;
	    /** Open specific terminal (doesn't work with output) */
	    open(name?: string): string;
	    /** Kill a terminal */
	    kill(name?: string): void;
	    /** Write on the current terminal and execute command */
	    exec(command: string, options?: Partial<TerminalOptions>): void;
	    /** Write on the current output */
	    write(text: string, options?: Partial<TerminalOptions>): void;
	}

}
declare module 'packages/engine/vscode/src/lib/contentimport' {
	import { IContentImport } from '@remixproject/plugin-api';
	import { ContentImport } from '@remixproject/plugin-api';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { CommandPlugin } from 'packages/engine/vscode/src/lib/command';
	import { RemixURLResolver } from '@remix-project/remix-url-resolver';
	export class ContentImportPlugin extends CommandPlugin implements MethodApi<IContentImport> {
	    urlResolver: RemixURLResolver;
	    constructor();
	    resolve(path: string): Promise<ContentImport>;
	    resolveAndSave(url: string, targetPath: string): Promise<string>;
	}

}
declare module 'packages/engine/vscode/src/lib/appmanager' {
	import { PluginManager } from '@remixproject/engine';
	export class VscodeAppManager extends PluginManager {
	    pluginsDirectory: string;
	    target: string;
	    constructor();
	    registeredPluginData(): Promise<any>;
	}

}
declare module 'packages/engine/vscode/src/index' {
	export * from 'packages/engine/vscode/src/lib/command';
	export * from 'packages/engine/vscode/src/lib/dynamic-list';
	export * from 'packages/engine/vscode/src/lib/extension';
	export * from 'packages/engine/vscode/src/lib/theme';
	export * from 'packages/engine/vscode/src/lib/webview';
	export * from 'packages/engine/vscode/src/lib/window';
	export * from 'packages/engine/vscode/src/lib/filemanager';
	export * from 'packages/engine/vscode/src/lib/editor';
	export * from 'packages/engine/vscode/src/lib/terminal';
	export * from 'packages/engine/vscode/src/lib/contentimport';
	export * from 'packages/engine/vscode/src/lib/appmanager';

}
declare module 'packages/engine/web/src/lib/iframe' {
	import type { Message, Profile, ExternalProfile, LocationProfile } from '@remixproject/plugin-utils';
	import { PluginConnector } from '@remixproject/engine';
	export type IframeProfile = Profile & LocationProfile & ExternalProfile;
	/**
	 * Connect an Iframe client to the engine.
	 * @dev This implements the ViewPlugin as it cannot extends two class. Maybe use a mixin at some point
	 */
	export class IframePlugin extends PluginConnector {
	    profile: IframeProfile;
	    private readonly listener;
	    private iframe;
	    private origin;
	    private source;
	    private url;
	    constructor(profile: IframeProfile);
	    /** Implement "activate" of the ViewPlugin */
	    connect(url: string): Promise<unknown>;
	    /** Implement "deactivate" of the ViewPlugin */
	    disconnect(): Promise<any>;
	    /** Get message from the iframe */
	    private getEvent;
	    /**
	     * Post a message to the iframe of this plugin
	     * @param message The message to post
	     */
	    protected send(message: Partial<Message>): void;
	    /** Create and return the iframe */
	    render(): HTMLIFrameElement;
	}

}
declare module 'packages/engine/web/src/lib/ws' {
	import type { Message, Profile, ExternalProfile } from '@remixproject/plugin-utils';
	import { PluginConnector, PluginConnectorOptions } from '@remixproject/engine';
	export interface WebsocketOptions extends PluginConnectorOptions {
	    /** Time (in ms) to wait before reconnection after connection closed */
	    reconnectDelay: number;
	}
	export class WebsocketPlugin extends PluginConnector {
	    private readonly listeners;
	    private url;
	    protected socket: WebSocket;
	    protected options: WebsocketOptions;
	    constructor(profile: Profile & ExternalProfile, options?: Partial<WebsocketOptions>);
	    private getEvent;
	    /** Try to reconnect to net websocket if closes */
	    private onclose;
	    /** Open a connection with the server (also used for reconnection) */
	    protected open(): void;
	    protected send(message: Partial<Message>): void;
	    protected connect(url: string): void;
	    protected disconnect(): void;
	}

}
declare module 'packages/engine/web/src/lib/theme' {
	import { Plugin } from '@remixproject/engine';
	import { MethodApi } from '@remixproject/plugin-utils';
	import { ITheme, Theme } from '@remixproject/plugin-api'; type DeepPartial<T> = {
	    [P in keyof T]?: DeepPartial<T[P]>;
	};
	/**
	 * Utils function to create a theme with default value
	 * Default values are taken from material design with colors
	 * - primary: indigo
	 * - secondary: pink
	 * - warn: orange
	 * - error: red
	 */
	export function createTheme(params?: DeepPartial<Theme>): Theme;
	export class ThemePlugin extends Plugin implements MethodApi<ITheme> {
	    protected getTheme: typeof createTheme;
	    protected theme: Theme;
	    constructor();
	    /** Internal API to set the current theme */
	    setTheme(theme: DeepPartial<Theme>): void;
	    /** External API to get the current theme */
	    currentTheme(): Promise<Theme>;
	}
	export {};

}
declare module 'packages/engine/web/src/lib/window' {
	import { Plugin } from '@remixproject/engine';
	import { IWindow } from '@remixproject/plugin-api';
	import { MethodApi, PluginOptions } from '@remixproject/plugin-utils';
	export class WindowPlugin extends Plugin implements MethodApi<IWindow> {
	    constructor(options?: PluginOptions);
	    /** Display an input window */
	    prompt(message?: string): Promise<string>;
	    /** Ask confirmation for an action */
	    confirm(message: string): Promise<boolean>;
	    /** Display a message with actions button. Returned the button clicked if any */
	    alert(message: string, actions?: string[]): Promise<void>;
	}

}
declare module 'packages/engine/web/src/lib/web-worker' {
	import type { Message, Profile, ExternalProfile, PluginOptions } from '@remixproject/plugin-utils';
	import { PluginConnector } from '@remixproject/engine'; type WebworkerOptions = WorkerOptions & PluginOptions;
	export class WebWorkerPlugin extends PluginConnector {
	    profile: Profile & ExternalProfile;
	    private worker;
	    protected options: WebworkerOptions;
	    constructor(profile: Profile & ExternalProfile, options?: WebworkerOptions);
	    setOptions(options: Partial<WebworkerOptions>): void;
	    connect(url: string): Promise<any>;
	    disconnect(): void;
	    /** Get message from the iframe */
	    private getEvent;
	    /**
	     * Post a message to the webview of this plugin
	     * @param message The message to post
	     */
	    protected send(message: Partial<Message>): void;
	}
	export {};

}
declare module 'packages/engine/web/src/lib/host' {
	import type { Profile } from '@remixproject/plugin-utils';
	import { Plugin } from '@remixproject/engine';
	export abstract class HostPlugin extends Plugin {
	    constructor(profile: Profile);
	    /**  Give the name of the current focus plugin */
	    abstract currentFocus(): string;
	    /** Display the view inside the host */
	    abstract focus(name: string): void;
	    /** Add the view of a plugin into the DOM */
	    abstract addView(profile: Profile, view: Element): void;
	    /** Remove the plugin from the view from the DOM */
	    abstract removeView(profile: Profile): void;
	}

}
declare module 'packages/engine/web/src/lib/view' {
	import type { Profile, LocationProfile } from '@remixproject/plugin-utils';
	import { Plugin } from '@remixproject/engine';
	export function isView<P extends Profile>(profile: Profile): profile is (ViewProfile & P);
	export type ViewProfile = Profile & LocationProfile;
	export abstract class ViewPlugin extends Plugin {
	    profile: ViewProfile;
	    abstract render(): Element;
	    constructor(profile: ViewProfile);
	    activate(): Promise<void>;
	    deactivate(): void;
	}

}
declare module 'packages/engine/web/src/index' {
	export * from 'packages/engine/web/src/lib/iframe';
	export * from 'packages/engine/web/src/lib/ws';
	export * from 'packages/engine/web/src/lib/theme';
	export * from 'packages/engine/web/src/lib/window';
	export * from 'packages/engine/web/src/lib/web-worker';
	export * from 'packages/engine/web/src/lib/host';
	export * from 'packages/engine/web/src/lib/view';

}
declare module 'packages/engine/web/tests/iframe.spec' {
	export {};

}
declare module 'packages/engine/web/tests/view.spec' {
	/// <reference types="jest" />
	import { Engine } from 'packages/engine/core/src';
	export class MockEngine extends Engine {
	    onRegistration: jest.Mock<any, any>;
	}

}
declare module 'packages/engine/web/tests/websocket.spec' {
	export {};

}
declare module 'packages/plugin/child-process/src/lib/connector' {
	import { ClientConnector, Client, PluginClient } from '@remixproject/plugin';
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	export interface WS {
	    send(data: string): void;
	    on(type: 'message', cb: (event: string) => any): this;
	}
	/**
	 * This Websocket connector works with the library ws
	 */
	export class WebsocketConnector implements ClientConnector {
	    private websocket;
	    constructor(websocket: WS);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Websocket plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 *
	 * ---------
	 * @example
	 * typescript
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws)
	 * })
	 * 
	 * ---------
	 * @example
	 * typescript
	 * class MyPlugin extends PluginClient {
	 *  methods = ['hello']
	 *  hello() {
	 *   console.log('Hello World')
	 *  }
	 * }
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws, new MyPlugin())
	 * })
	 * 
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(websocket: WS, client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'packages/plugin/child-process/src/index' {
	export * from 'packages/plugin/child-process/src/lib/connector';

}
declare module 'packages/plugin/core/tests/api.spec' {
	export {};

}
declare module 'packages/plugin/core/tests/client.spec' {
	export {};

}
declare module 'packages/plugin/core/tests/node.spec' {
	export {};

}
declare module 'packages/plugin/core/tests/origin.spec' {
	export {};

}
declare module 'packages/plugin/core/tests/remix-api.spec' {
	export {};

}
declare module 'packages/plugin/core/tests/service.spec' {
	export {};

}
declare module 'packages/plugin/iframe/src/lib/theme' {
	import { PluginClient, PluginOptions } from '@remixproject/plugin';
	/** Start listening on theme changed */
	export function listenOnThemeChanged(client: PluginClient, options?: Partial<PluginOptions<any>>): Promise<HTMLLinkElement>;

}
declare module 'packages/plugin/iframe/src/lib/connector' {
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	import { ClientConnector, Client, PluginClient, PluginOptions } from '@remixproject/plugin';
	export class IframeConnector implements ClientConnector {
	    private options;
	    source: Window;
	    origin: string;
	    constructor(options: PluginOptions<any>);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect an Iframe client to a web engine
	 * @param client An optional iframe client to connect to the engine
	 * @example Let the function create a client
	 * typescript
	 * const client = createClient()
	 * 
	 * @example With a custom client
	 * typescript
	 * class MyPlugin extends PluginClient {
	 *  methods = ['hello']
	 *  hello() {
	 *   console.log('Hello World')
	 *  }
	 * }
	 * const client = createClient(new MyPlugin())
	 * 
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'packages/plugin/iframe/src/index' {
	export * from 'packages/plugin/iframe/src/lib/connector';
	export * from 'packages/plugin/iframe/src/lib/theme';

}
declare module 'packages/plugin/iframe/tests/iframe.spec' {
	export {};

}
declare module 'packages/plugin/vscode/src/lib/webview' {
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { ClientConnector, Client, PluginClient, PluginOptions } from '@remixproject/plugin';
	/**
	 * This Webview connector
	 */
	export class WebviewConnector implements ClientConnector {
	    private options;
	    source: {
	        postMessage: (message: any, origin?: string) => void;
	    };
	    origin: string;
	    isVscode: boolean;
	    constructor(options?: Partial<PluginOptions<any>>);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Webview plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>>>(client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'packages/plugin/vscode/src/lib/extension' {
	export {};

}
declare module 'packages/plugin/vscode/src/index' {
	export * from 'packages/plugin/vscode/src/lib/webview';
	export * from 'packages/plugin/vscode/src/lib/extension';

}
declare module 'packages/plugin/webview/src/lib/connector' {
	import type { Message, Api, PluginApi } from '@remixproject/plugin-utils';
	import { ClientConnector, PluginClient, PluginOptions } from '@remixproject/plugin';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile'; global {
	    function acquireTheiaApi(): any;
	}
	/**
	 * This Webview connector
	 */
	export class WebviewConnector implements ClientConnector {
	    private options;
	    source: {
	        postMessage: (message: any, origin?: string) => void;
	    };
	    origin: string;
	    isVscode: boolean;
	    constructor(options: PluginOptions<any>);
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get messae from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	    pasteClipBoard(event: any): void;
	    insertAtCursor(element: any, value: any): void;
	    forwardEvents(): void;
	}
	/**
	 * Connect a Webview plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 */
	export const createClient: <P extends Api = any, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>, C extends PluginClient<P, App> = any>(client: C) => C & PluginApi<App>;

}
declare module 'packages/plugin/webview/src/index' {
	export * from 'packages/plugin/webview/src/lib/connector';

}
declare module 'packages/plugin/webworker/src/lib/connector' {
	/// <reference lib="webworker" />
	import { ClientConnector, Client, PluginClient } from '@remixproject/plugin';
	import type { Message, Api } from '@remixproject/plugin-utils';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	export class WebworkerConnector implements ClientConnector {
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get message from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Websocket plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'packages/plugin/webworker/src/index' {
	export * from 'packages/plugin/webworker/src/lib/connector';

}
declare module 'packages/plugin/ws/src/lib/ws' {
	import { Message, Api } from '@remixproject/plugin-utils';
	import { PluginClient, ClientConnector, Client } from '@remixproject/plugin';
	import { IRemixApi } from 'packages/api/src/lib/remix-profile';
	export interface WS {
	    send(data: string): void;
	    on(type: 'message', cb: (event: string) => any): this;
	}
	/**
	 * This Websocket connector works with the library ws
	 */
	export class WebsocketConnector implements ClientConnector {
	    private websocket;
	    private client;
	    constructor(websocket: WS);
	    setClient(client: PluginClient): void;
	    /** Send a message to the engine */
	    send(message: Partial<Message>): void;
	    /** Get message from the engine */
	    on(cb: (message: Partial<Message>) => void): void;
	}
	/**
	 * Connect a Websocket plugin client to a web engine
	 * @param client An optional websocket plugin client to connect to the engine.
	 *
	 * ---------
	 * @example
	 * typescript
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws)
	 * })
	 * 
	 * ---------
	 * @example
	 * typescript
	 * class MyPlugin extends PluginClient {
	 *  methods = ['hello']
	 *  hello() {
	 *   console.log('Hello World')
	 *  }
	 * }
	 * const wss = new WebSocket.Server({ port: 8080 });
	 * wss.on('connection', (ws) => {
	 *  const client = createClient(ws, new MyPlugin())
	 * })
	 * 
	 */
	export const createClient: <P extends Api, App extends Readonly<Record<string, Api>> = Readonly<IRemixApi>>(websocket: WS, client?: PluginClient<P, App>) => Client<P, App>;

}
declare module 'packages/plugin/ws/src/index' {
	export * from 'packages/plugin/ws/src/lib/ws';

}
declare module 'packages/utils/tests/event-name.spec' {
	export {};

}
declare module 'packages/utils/tests/method-path.spec' {
	export {};

}
`
