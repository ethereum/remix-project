import React from 'react' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import { AppModal } from 'libs/remix-ui/app/src'
import { PermissionHandlerDialog, PermissionHandlerValue } from 'libs/remix-ui/permission-handler/src'
import { Profile } from '@remixproject/plugin-utils'

const profile = {
    name: 'permissionhandler',
    displayName: 'permissionhandler',
    description: 'permissionhandler',
    methods: ['askPermission']
}

export class PermissionHandlerPlugin extends Plugin {
    permissions: any
    currentVersion: number
    fallbackMemory: boolean
    constructor() {
        super(profile)
        this.fallbackMemory = false
        this.permissions = this._getFromLocal()
        this.currentVersion = 1
        // here we remove the old permissions saved before adding 'permissionVersion'
        // since with v1 the structure has been changed because of new engine ^0.2.0-alpha.6 changes
        if (!localStorage.getItem('permissionVersion')) {
            localStorage.setItem('plugins/permissions', '')
            localStorage.setItem('permissionVersion', this.currentVersion.toString())
        }
    }

    _getFromLocal() {
        if (this.fallbackMemory) return this.permissions
        const permission = localStorage.getItem('plugins/permissions')
        return permission ? JSON.parse(permission) : {}
    }

    persistPermissions() {
        const permissions = JSON.stringify(this.permissions)
        try {
            localStorage.setItem('plugins/permissions', permissions)
        } catch (e) {
            this.fallbackMemory = true
            console.log(e)
        }
    }

    switchMode (from: Profile, to: Profile, method: string, set: boolean) {
        set
        ? this.permissions[to.name][method][from.name] = {}
        : delete this.permissions[to.name][method][from.name]
    }

    clear() {
        localStorage.removeItem('plugins/permissions')
    }

    notAllowWarning(from: Profile, to: Profile, method: string) {
        return `${from.displayName || from.name} is not allowed to call ${method} method of ${to.displayName || to.name}.`
    }

    async getTheme() {
        return (await this.call('theme', 'currentTheme')).quality
    }

    /**
     * Check if a plugin has the permission to call another plugin and askPermission if needed
     * @param {PluginProfile} from the profile of the plugin that make the call
     * @param {ModuleProfile} to The profile of the module that receive the call
     * @param {string} method The name of the function to be called
     * @param {string} message from the caller plugin to add more details if needed
     * @returns {Promise<boolean>}
     */
    async askPermission(from: Profile, to: Profile, method: string, message: string, sensitiveCall: boolean) {
        try {
            this.permissions = this._getFromLocal()
            if (!this.permissions[to.name]) this.permissions[to.name] = {}
            if (!this.permissions[to.name][method]) this.permissions[to.name][method] = {}
            if (!this.permissions[to.name][method][from.name]) return this.openPermission(from, to, method, message, sensitiveCall)

            const { allow, hash } = this.permissions[to.name][method][from.name]
            if (!allow) {
                const warning = this.notAllowWarning(from, to, method)
                this.call('notification', 'toast', warning)
                return false
            }
            return hash === from.hash
                ? true // Allow
                : await this.openPermission(from, to, method, message, sensitiveCall)
        } catch (err) {
            throw new Error(err)
        }
    }

    async openPermission(from: Profile, to: Profile, method: string, message: string, sensitiveCall: boolean) {
        const remember = this.permissions[to.name][method][from.name]
        const value: PermissionHandlerValue = {
            from,
            to,
            method,
            message,
            remember,
            sensitiveCall
        }
        const modal: AppModal = {
            id: 'PermissionHandler',
            title: `Permission needed for ${to.displayName || to.name}`,
            message: <PermissionHandlerDialog plugin={this} theme={await this.getTheme()} value={value}></PermissionHandlerDialog>,
            okLabel: 'Accept',
            cancelLabel: 'Decline'
        }

        const result = await this.call('notification', 'modal', modal)
        return new Promise((resolve, reject) => {
            if (result) {
                if (this.permissions[to.name][method][from.name]) {
                    this.permissions[to.name][method][from.name] = {
                        allow: true,
                        hash: from.hash
                    }
                    this.persistPermissions()
                }
                resolve(true)
            } else {
                if (this.permissions[to.name][method][from.name]) {
                    this.permissions[to.name][method][from.name] = {
                        allow: false,
                        hash: from.hash
                    }
                    this.persistPermissions()
                }
                reject(this.notAllowWarning(from, to, method))
            }
        })
    }
}
