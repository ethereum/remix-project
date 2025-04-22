# INSTRUCTIONS FOR METAMASK

CRX extenions are now not longer supported by CHROME
that is why we have to use the dist build of the metamask extension
however that's a special build, because Metamask secured the normal build use Lavamoat which doesn't allow e2e to manipulat the DOM
so we build the extension off site on https://github.com/remix-project-org/metamask-dist on a schedule
the command
```yarn update_metamask```
will install the extension from that repo
you need to call this when testing locally to get the extension
also you need to set account passphrase and password in the .env.local for the extension to work properly
