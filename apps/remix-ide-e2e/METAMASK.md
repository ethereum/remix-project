# INSTRUCTIONS FOR METAMASK

CRX extensions are now no longer supported by CHROME
That is why we have to use the dist build of the metamask extension
However that's a special build, because Metamask secured the normal build uses Lavamoat which doesn't allow e2e to manipulate the DOM
So we build the extension off-site on https://github.com/remix-project-org/metamask-dist on a schedule
the command
```yarn update_metamask```
will install the extension from that repo
You need to call this when testing locally to get the extension
Also you need to set the account passphrase and password in the .env.local for the extension to work properly