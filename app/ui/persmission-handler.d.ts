export class PermissionHandler {
    permissions: any;
    currentVersion: number;
    _getFromLocal(): any;
    persistPermissions(): void;
    clear(): void;
    /**
     * Show a message to ask the user for a permission
     * @param {PluginProfile} from The name and hash of the plugin that make the call
     * @param {ModuleProfile} to The name of the plugin that receive the call
     * @param {string} method The name of the function to be called
     * @param {string} message from the caller plugin to add more details if needed
     * @returns {Promise<{ allow: boolean; remember: boolean }} Answer from the user to the permission
     */
    openPermission(from: any, to: any, method: string, message: string): Promise<{
        allow: boolean;
        remember: boolean;
    }>;
    /**
     * Check if a plugin has the permission to call another plugin and askPermission if needed
     * @param {PluginProfile} from the profile of the plugin that make the call
     * @param {ModuleProfile} to The profile of the module that receive the call
     * @param {string} method The name of the function to be called
     * @param {string} message from the caller plugin to add more details if needed
     * @returns {Promise<boolean>}
     */
    askPermission(from: any, to: any, method: string, message: string): Promise<boolean>;
    /**
     * The permission form
     * @param {PluginProfile} from The name and hash of the plugin that make the call
     * @param {ModuleProfile} to The name of the plugin that receive the call
     * @param {string} method The name of te methode to be called
     * @param {string} message from the caller plugin to add more details if needed
     */
    form(from: any, to: any, method: string, message: string): any;
}
