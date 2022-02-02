/* global _ */

/**
 * This is loaded as a content script.
 * It defines the function removeMediumBanners which can be used if we want to remove banners on medium.com
 */

/**
 * Remove annoying banners / headers / footers from a medium.com page
 */
// eslint-disable-next-line
const removeMediumBanners = (() => {
  const NAV_SELECTOR = 'nav'
  const STICKY_FOOTER_SELECTOR = '.js-stickyFooter'
  const STICKY_HEADER_SELECTOR = '.metabar.js-metabar'
  const BOTTOM_BANNER_SELECTOR = '.js-meterBanner'
  const BOTTOM_BANNER_TEXT = 'Get one more story in your member preview when you sign up'
  const LEFT_SIDEBAR_PANEL_SELECTOR = "[data-test-id='post-sidebar']"
  const RIGHT_SIDEBAR_PANEL_TITLE_TEXT = 'Related'

  const nthGenerationParent = nth => _.eq(nth)(0)
    ? _.identity
    : _.pipe(
      _.whenExists(_.parentNode),
      _.whenExists(nthGenerationParent(nth - 1))
    )

  const hasText = text => node => node.textContent.includes(text)

  const getBottomFreeSignUpExtraPreviewBanner = _.pipe(
    _.querySelectorAll('h2'),
    _.filter(hasText(BOTTOM_BANNER_TEXT)),
    _.first,
    nthGenerationParent(6)
  )

  const getRightSidebarPanel = _.pipe(
    _.querySelectorAll('strong'),
    _.filter(hasText(RIGHT_SIDEBAR_PANEL_TITLE_TEXT)),
    _.first,
    nthGenerationParent(9)
  )

  const getMediumBanners = _.pipe(
    domNode => ([
      _.querySelector(STICKY_FOOTER_SELECTOR)(domNode),
      /** Prefer the more granular sticky header - but sometimes the class names seem to be obfuscated, so just grab the nav element */
      _.querySelector(STICKY_HEADER_SELECTOR)(domNode) || _.querySelector(NAV_SELECTOR)(domNode),
      _.querySelector(BOTTOM_BANNER_SELECTOR)(domNode),
      ...(_.querySelectorAll(LEFT_SIDEBAR_PANEL_SELECTOR)(domNode)),
      getRightSidebarPanel(domNode),
      getBottomFreeSignUpExtraPreviewBanner(domNode)
    ]),
    _.filter(_.isTruthy)
  )

  /** removes the medium ad and popup banners from the page */
  return _.pipe(
    () => _.logInfo('Removing Medium.com banners'),
    () => getMediumBanners(document),
    _.map(_.removeDomNode),
    () => _.logInfo('Medium.com banners cleared')
  )
})()
