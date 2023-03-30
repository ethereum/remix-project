/* eslint-disable @typescript-eslint/no-var-requires */
import { mapKeys } from './utils/map-keys';
import { DocItemContext } from './site';

import * as defaultProperties from './common/properties';
import * as themeHelpers from  './themes/markdown/helpers'

const common = require('./themes/markdown/common.hbs');
const contract = require('./themes/markdown/contract.hbs');
const enum_ = require('./themes/markdown/enum.hbs');
const error = require('./themes/markdown/error.hbs');
const event = require('./themes/markdown/event.hbs');
const function_ = require('./themes/markdown/function.hbs');
const modifier = require('./themes/markdown/modifier.hbs');
const page = require('./themes/markdown/page.hbs');
const struct = require('./themes/markdown/struct.hbs');
const variable = require('./themes/markdown/variable.hbs');
const userDefinedValueType = require('./themes/markdown/user-defined-value-type.hbs');

export type PropertyGetter = (ctx: DocItemContext, original?: unknown) => unknown;
export type Properties = Record<string, PropertyGetter>;

export interface Templates {
  partials?: Record<string, () => string>;
  helpers?: Record<string, (...args: unknown[]) => string>;
  properties?: Record<string, PropertyGetter>;
}

/**
 * Loads the templates that will be used for rendering a site based on a
 * default theme and user templates.
 *
 * The result contains all partials, helpers, and property getters defined in
 * the user templates and the default theme, where the user's take precedence
 * if there is a clash. Additionally, all theme partials and helpers are
 * included with the theme prefix, e.g. `markdown/contract` will be a partial.
 */
export async function loadTemplates(defaultTheme: string, root: string, userTemplatesPath?: string): Promise<Templates> {
  const themes = await readThemes();

  // Initialize templates with the default theme.
  const templates: Required<Templates> = {
    partials: { ...themes[defaultTheme]?.partials },
    helpers: { ...themes[defaultTheme]?.helpers },
    properties: { ...defaultProperties },
  };


  // Add partials and helpers from all themes, prefixed with the theme name.
  for (const [themeName, theme] of Object.entries(themes)) {
    const addPrefix = (k: string) => `${themeName}/${k}`;
    Object.assign(templates.partials, mapKeys(theme.partials, addPrefix));
    Object.assign(templates.helpers, mapKeys(theme.helpers, addPrefix));
  }

  return templates;
}

/**
 * Read templates and helpers from a directory.
 */
export async function readTemplates(): Promise<Required<Templates>> {
  return {
    partials: await readPartials(),
    helpers: await readHelpers('helpers'),
    properties: await readHelpers('properties'),
  };
}

async function readPartials() {
  const partials: NonNullable<Templates['partials']> = {};

  partials["common"] = () => common
  partials["contract"] = () => contract
  partials["enum"] = () => enum_
  partials["error"] = () => error
  partials["event"] = () => event
  partials["function"] = () => function_
  partials["modifier"] = () => modifier
  partials["page"] = () => page
  partials["struct"] = () => struct
  partials["variable"] = () => variable
  partials["user-defined-value-type"] = () => userDefinedValueType

  return partials;
}

async function readHelpers(name: string) {
  
  const helpers: Record<string, (...args: any[]) => any> = {};

  for (const name in themeHelpers) {
    if (typeof themeHelpers[name] === 'function') {
      helpers[name] = themeHelpers[name];
    }
  }
  
  return helpers;
}

/**
 * Reads all built-in themes into an object. Partials will always be found in
 * src/themes, whereas helpers may instead be found in dist/themes if TypeScript
 * can't be imported directly.
 */
async function readThemes(): Promise<Record<string, Required<Templates>>> {
  const themes: Record<string, Required<Templates>> = {}
  themes['markdown'] = await readTemplates()
  return themes
}
