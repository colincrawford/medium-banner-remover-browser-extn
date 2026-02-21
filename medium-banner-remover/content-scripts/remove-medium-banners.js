/* global _ */

/**
 * Removes annoying banners, popups, and overlays from Medium.com pages.
 *
 * Medium uses obfuscated class names that change frequently, so we target
 * structural/semantic selectors (roles, attributes, element types) rather
 * than specific class names for resilience.
 */
// eslint-disable-next-line
const removeMediumBanners = (() => {
  /** Selectors for elements that should be removed outright */
  const REMOVE_SELECTORS = [
    // Signup / login dialog modals
    'div[role="dialog"]',
    // Notification banners (cookie consent, privacy notices)
    'div[role="alert"]',
    // Navigation bar
    'nav',
    // Legacy selectors (may still apply on some custom Medium domains)
    '.js-stickyFooter',
    '.metabar.js-metabar',
    '.js-meterBanner'
  ]

  /** Selectors for elements that contain a privacy policy link (popup wrappers) */
  const PRIVACY_BANNER_SELECTOR = 'a[href*="policy.medium.com/medium-privacy-policy"]'

  const findPrivacyBannerRoot = domNode => {
    const link = domNode.querySelector(PRIVACY_BANNER_SELECTOR)
    if (!link) return null
    // Walk up to find the top-level overlay wrapper (direct child of body)
    let el = link
    while (el.parentNode && el.parentNode !== domNode.body && el.parentNode !== domNode) {
      el = el.parentNode
    }
    return el
  }

  const restoreScrolling = () => {
    document.documentElement.style.setProperty('overflow', 'auto', 'important')
    document.body.style.setProperty('overflow', 'auto', 'important')
  }

  const collectBanners = domNode => {
    const elements = []

    REMOVE_SELECTORS.forEach(selector => {
      domNode.querySelectorAll(selector).forEach(el => elements.push(el))
    })

    const privacyBanner = findPrivacyBannerRoot(domNode)
    if (privacyBanner) elements.push(privacyBanner)

    // Remove fixed/sticky overlays at top and bottom of viewport
    domNode.querySelectorAll('div').forEach(el => {
      const style = window.getComputedStyle(el)
      if (style.position !== 'fixed' && style.position !== 'sticky') return
      const rect = el.getBoundingClientRect()
      const isTopBanner = rect.top <= 0 && rect.height < 200
      const isBottomBanner = rect.bottom >= window.innerHeight - 5 && rect.height < 300
      if (isTopBanner || isBottomBanner) {
        elements.push(el)
      }
    })

    return elements
  }

  return _.pipe(
    () => _.logInfo('Removing Medium.com banners'),
    () => collectBanners(document),
    _.filter(_.isTruthy),
    _.tap(els => _.logInfo(`Found ${els.length} banner element(s) to remove`)),
    _.map(_.removeDomNode),
    () => restoreScrolling(),
    () => _.logInfo('Medium.com banners cleared')
  )
})()
