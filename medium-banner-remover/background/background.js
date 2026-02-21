/* global _, self */

/**
 * Service worker that listens for extension icon clicks
 * and sends a message to the content script to clear banners.
 */
self.importScripts('../shared.js')
_.logInfo('Service worker running')

const sendMessageToClearBanners = () => _.getCurrentTab()
  .then(_.tap(() => _.logInfo('Service worker sending message to content script to clear banners')))
  .then(tab => _.sendMessageToTab(tab)(_.CLEAR_BANNERS_MSG))

_.registerOnExtensionIconClicked(_.pipe(
  () => _.logInfo('Service worker received a click from the extension icon'),
  sendMessageToClearBanners
))
