/* global _, removeMediumBanners, MutationObserver */

/**
 * Content script injected into Medium.com pages.
 * Listens for messages from the service worker and optionally
 * auto-runs banner removal on page load.
 *
 * Uses a MutationObserver to catch banners that Medium injects
 * dynamically after the initial page load.
 */
(() => {
  let debounceTimer = null

  const debouncedClearBanners = () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(removeMediumBanners, 300)
  }

  const observeDom = () => {
    const observer = new MutationObserver(debouncedClearBanners)
    observer.observe(document.body, { childList: true, subtree: true })
    // Stop observing after 30 seconds to avoid unnecessary overhead
    setTimeout(() => observer.disconnect(), 30000)
  }

  const runIfAutoRunIsSet = () => _.getFromStorage(_.AUTO_RUN_STORAGE_KEY)
    .then(storage => _.isTruthy(storage[_.AUTO_RUN_STORAGE_KEY]))
    .then(autoRun => {
      if (!autoRun) return
      removeMediumBanners()
      observeDom()
    })
    .catch(error => _.logError('Error in content-script.js', error))

  const onMessage = _.match([
    [_.eq(_.CLEAR_BANNERS_MSG), removeMediumBanners]
  ])

  const main = () => {
    runIfAutoRunIsSet()
    _.registerMessageListener(onMessage)
  }

  main()
})()
