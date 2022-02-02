/* global _, removeMediumBanners */

/**
 * This script is injected when webpages are loaded.
 */

(() => {
  const websiteIsMedium = () => window.location.href.includes('medium.com')

  const defaultBannerClearer = _.pipe(
    () => _.logInfo('Clearing banners...'),
    () => ['header', 'nav'],
    _.map(selector => _.querySelector(selector)(document)),
    _.filter(_.isTruthy),
    _.map(_.removeDomNode),
    () => _.logInfo('Banners cleared')
  )

  const clearBanners = _.match(
    [[websiteIsMedium, removeMediumBanners]],
    defaultBannerClearer
  )

  const runIfAutoRunIsSet = () => _.getFromStorage(_.AUTO_RUN_STORAGE_KEY)
    .then(storage => _.isTruthy(storage[_.AUTO_RUN_STORAGE_KEY]))
    .then(_.whenExists(clearBanners))
    .catch(error => _.logError('Error in content-script.js', error))

  const onMessage = _.match([
    [_.eq(_.CLEAR_BANNERS_MSG), clearBanners]
  ])

  const main = () => {
    runIfAutoRunIsSet()
    _.registerMessageListener(onMessage)
  }

  main()
})()
