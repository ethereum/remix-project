# Contributing

Everyone is very welcome to contribute on the codebase of Remix. Please reach us in [Gitter](https://gitter.im/ethereum/remix) in case of any queries.

## Development
Remix libraries work closely with [Remix IDE](https://remix.ethereum.org). Each library has a readme to explain its application.

When you add a code in any library, please ensure you add related tests. You can visit [here](https://github.com/ethereum/remix-ide#installation) to test your changes by linking the remix libraries with Remix IDE.

## Coding style

Please conform to [standard](https://standardjs.com/) for code styles.

## Submitting Pull Request
Please follow GitHub's standard model of making changes & submitting pull request which is very well explained [here](https://guides.github.com/activities/forking/). Make sure your code works fine locally before submitting a pull request.

## Internationalization
Remix now supports Internationalization. Everyone is welcome to contribute to this feature.

### How to make a string support intl?
First, put the string in the locale file located under `apps/remix-ide/src/app/tabs/locales/en`.
Each json file corresponds to a module. If the module does not exist, then create a new json and import it in the `index.js`.
Then you can replace the string with a intl component. The `id` prop will be the key of this string.
```jsx
<label className="py-2 align-self-center m-0" style={{fontSize: "1.2rem"}}>
-  Learn
+  <FormattedMessage id="home.learn" />
</label>
```
In some cases, jsx maybe not acceptable, you can use `intl.formatMessage` .
```jsx
<input
   ref={searchInputRef}
   type="text"
   className="border form-control border-right-0"
   id="searchInput"
-  placeholder="Search Documentation"
+  placeholder={intl.formatMessage({ id: "home.searchDocumentation" })}
   data-id="terminalInputSearch"
/>
```

### How to add another language support?
Let's say you want to add French.

First, create a folder named by the language code which is `fr`.
Then, create a json file, let's say `panel.json`,
```json
{
  "panel.author": "Auteur",
  "panel.maintainedBy": "Entretenu par",
  "panel.documentation": "Documentation",
  "panel.description": "La description"
}
```
Then, create a `index.js` file like this,
```js
import panelJson from './panel.json';
import enJson from '../en';

// There may have some un-translated content. Always fill in the gaps with EN JSON.
// No need for a defaultMessage prop when render a FormattedMessage component.
export default Object.assign({}, enJson, {
  ...panelJson,
})
```
Then, import `index.js` in `apps/remix-ide/src/app/tabs/locale-module.js`
```js
import enJson from './locales/en'
import zhJson from './locales/zh'
+import frJson from './locales/fr'

const locales = [
  { code: 'en', name: 'English', localeName: 'English', messages: enJson },
  { code: 'zh', name: 'Chinese Simplified', localeName: '简体中文', messages: zhJson },
+  { code: 'fr', name: 'French', localeName: 'Français', messages: frJson },
]
```
You can find the language's `code, name, localeName` in this link
https://github.com/ethereum/ethereum-org-website/blob/dev/i18n/config.json

### Whether or not to use `defaultMessage`?
If you search `FormattedMessage` or `intl.formatMessage` in this project, you will notice that most of them only have a `id` prop, but a few of them have a `defaultMessage` prop.

**Why?**

Each non-english language will be filled in the gaps with english. Even though there may be some un-translated content, it will always use english as defaultMessage. That's why we don't need to provide a `defaultMessage` prop each time we render a `FormattedMessage` component.

But in some cases, the `id` prop may not be static. For example,
```jsx
<h6 className="pt-0 mb-1" data-id='sidePanelSwapitTitle'>
 <FormattedMessage id={plugin?.profile.name + '.displayName'} defaultMessage={plugin?.profile.displayName || plugin?.profile.name} />
</h6>
```
You can't be sure there is a match key in locale file or not. So it will be better to provide a `defaultMessage` prop.
