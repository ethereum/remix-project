
/**
 * Generated using theia-plugin-generator
 */

import * as theia from '@theia/plugin';

export function start(context: theia.PluginContext) {
  const informationMessageTestCommand = {
    id: 'hello-world-example-generated',
    label: "Hello World"
  };
  context.subscriptions.push(theia.commands.registerCommand(informationMessageTestCommand, (...args: any[]) => {
    theia.window.showInformationMessage('Hello World!');
  }));

}

export function stop() {

}
