# REMIX DESKTOP

## Development

In the main repo yarn, then run yarn serve 
In this directory apps/remixdesktop, yarn, then run: yarn start:dev to boot the electron app
In chrome chrome://inspect/#devices you can add localhost:5858 to the network targets and then you will see an inspect button electron/js2c/browser_init
file:///
You can use that to inspect the output of the electron app

If you run into issues with yarn when native node modules are being rebuilt you need
- Windows: install Visual Studio Tools with Desktop Development C++ enabled in the Workloads
- MacOS: install Xcode or Xcode Command Line Tools
- Linux: unknown, probably a C++ compiler

## Builds

Builds can be found in the artefacts of CI. 

## CI

CI will only run the builds is the branch is master or contains the word: desktop