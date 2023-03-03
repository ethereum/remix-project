# Remix EthDoc Plugin

The Remix EthDoc plugin allow you to generate HTML documents from solidity smart contracts. It also gives you the capability to publish the generated HTML documents to IPFS.

## Activate

EthDoc consists of 2 plugins: the EthDoc Viewer and the EthdDoc Generator. The EthDoc Generator will activate the EthDoc Viewer, so to use EthDoc, you only need to activate EthDoc Generator.

The following image illustrates both sections of the plugin.

![Screenshot](img/ethdoc.png)

The EthDoc viewer appears in a tab in the main area of the Remix Editor and the EthDoc generator will appear in the side panel.

## How to generate documentation

To generate HTML documents, the first thing you need to do is to compile smart contracts.

Once the contracts are compiled, go to the EthDoc Generator in the side panel and click the button to generate the docs. To see the generated docs, click the EthDoc Viewer tab in Remix's Editor.

## How to publish

In order to publish an HTML document, you need to first select a generated HTML document and then click the "Publish" button.

Then, you should be redirected to the published version of the HTML document.

## Issues

If you have any issues, please feel free to create an issue in our [Github repository](https://github.com/Machinalabs/remix-ethdoc-plugin/issues).
