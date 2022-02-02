/* global _ */

/**
 * This script runs as a service worker in the background of the browser
 * https://developer.chrome.com/docs/extensions/mv3/service_workers/
 */
// eslint-disable-next-line
self.importScripts('../shared.js')
_.logInfo('Service worker running')

const sendMessageToClearBanners = () => _.getCurrentTab()
  .then(_.tap(() => _.logInfo('Service worker sending message to content script to clear banners')))
  .then(tab => _.sendMessageToTab(tab)(_.CLEAR_BANNERS_MSG))

/**
 * When the user clicks the extension's icon on the browser toolbar,
 * we send a message to the content script to remove banners from the page
 */
_.registerOnExtensionIconClicked(_.pipe(
  () => _.logInfo('Service worker received a click from the extension icon'),
  sendMessageToClearBanners
))
