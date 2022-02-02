[![CircleCI](https://circleci.com/gh/colincrawford/medium-banner-remover-browser-extn/tree/master.svg?style=svg)](https://circleci.com/gh/colincrawford/medium-banner-remover-browser-extn/tree/master)

# medium-banner-remover-browser-extn

Simple browser extension to remove annoying medium banners on articles

### To use:

After opening a medium article, click the addon icon on your toolbar and the banners should disappear

https://chrome.google.com/webstore/detail/bophhfkkhlfjikhlpbjkiiknaepnkkcc  
https://addons.mozilla.org/en-US/firefox/addon/medium-banner-remover

- _Version 0.6 upgraded to extension manifest version 3 which Firefox does not yet support_

Architecture:

#### _Content Scripts_:

**content-script.js** - Gets injected into the page an removes annoying banners / headers. Runs either on load or on message from the service worker

**remove-medium-banners.js** - Defines a function for our main content script to use to remove banners from medium.com

#### _Options Menu_:

Defines a menu with html/css/js that can save user preferences to browser storage

#### _Service Worker_:

**background.js** - listens for the browser toolbar icon to be clicked, sends a message to content scripts when it is

TODO:

- [ ] Add unit tests (Jest & JSDOM?)
- [ ] Generalize past Medium.com (update app name, README, icon, etc...)
- [ ] Improve styles for the options menu
