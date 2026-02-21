[![CI](https://github.com/colincrawford/medium-banner-remover-browser-extn/actions/workflows/ci.yml/badge.svg)](https://github.com/colincrawford/medium-banner-remover-browser-extn/actions/workflows/ci.yml)

# medium-banner-remover-browser-extn

Simple browser extension to remove annoying medium banners on articles

### To use:

After opening a medium article, click the addon icon on your toolbar and the banners should disappear

https://chrome.google.com/webstore/detail/bophhfkkhlfjikhlpbjkiiknaepnkkcc
https://addons.mozilla.org/en-US/firefox/addon/medium-banner-remover

Architecture:

#### _Content Scripts_:

**content-script.js** - Gets injected into the page and removes annoying banners / headers. Runs either on load or on message from the service worker

**remove-medium-banners.js** - Defines a function for our main content script to use to remove banners from medium.com

#### _Options Menu_:

Defines a menu with html/css/js that can save user preferences to browser storage

#### _Service Worker_:

**background.js** - listens for the browser toolbar icon to be clicked, sends a message to content scripts when it is

### Development

Install dependencies:

```
npm install
```

Run lint and unit tests:

```
npm test
```

Run just the unit tests:

```
npm run test:unit
```

Build for distribution:

```
npm run build
```

TODO:

- [x] Add unit tests (Jest & JSDOM)
- [ ] Generalize past Medium.com (update app name, README, icon, etc...)
- [ ] Improve styles for the options menu
