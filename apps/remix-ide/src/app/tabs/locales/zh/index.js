import debuggerJson from './debugger.json';
import filePanelJson from './filePanel.json';
import homeJson from './home.json';
import panelJson from './panel.json';
import pluginManagerJson from './pluginManager.json';
import searchJson from './search.json';
import settingsJson from './settings.json';
import solidityJson from './solidity.json';
import terminalJson from './terminal.json';
import udappJson from './udapp.json';
import solidityUnitTestingJson from './solidityUnitTesting.json';
import permissionHandlerJson from './permissionHandler.json';
import enJson from '../en';

// There may have some un-translated content. Always fill in the gaps with EN JSON.
// No need for a defaultMessage prop when render a FormattedMessage component.
export default Object.assign({}, enJson, {
  ...debuggerJson,
  ...filePanelJson,
  ...homeJson,
  ...panelJson,
  ...pluginManagerJson,
  ...searchJson,
  ...settingsJson,
  ...solidityJson,
  ...terminalJson,
  ...udappJson,
  ...solidityUnitTestingJson,
  ...permissionHandlerJson,
})
