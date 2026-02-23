/* eslint-env jest */
const { loadScript } = require('./helpers')

// Mock chrome APIs
global.chrome = {
  storage: { sync: { get: jest.fn(), set: jest.fn() } },
  tabs: { query: jest.fn(), sendMessage: jest.fn() },
  runtime: { onMessage: { addListener: jest.fn() } },
  action: { onClicked: { addListener: jest.fn() } }
}

// Load shared.js first (provides global `_`)
loadScript('medium-banner-remover/shared.js')

// Mock window.getComputedStyle
const mockGetComputedStyle = jest.fn()
Object.defineProperty(window, 'getComputedStyle', { value: mockGetComputedStyle })

// Load the module under test
loadScript('medium-banner-remover/content-scripts/remove-medium-banners.js')

describe('removeMediumBanners', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    jest.spyOn(console, 'info').mockImplementation()
    mockGetComputedStyle.mockReturnValue({ position: 'static' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('removes dialog elements', () => {
    document.body.innerHTML = '<div role="dialog">Sign up now!</div><p>Article content</p>'
    removeMediumBanners()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.querySelector('p').textContent).toBe('Article content')
  })

  test('removes alert elements', () => {
    document.body.innerHTML = '<div role="alert">Cookie notice</div>'
    removeMediumBanners()
    expect(document.querySelector('[role="alert"]')).toBeNull()
  })

  test('removes nav elements', () => {
    document.body.innerHTML = '<nav>Navigation</nav><main>Content</main>'
    removeMediumBanners()
    expect(document.querySelector('nav')).toBeNull()
    expect(document.querySelector('main')).not.toBeNull()
  })

  test('removes Branch.io smart banners', () => {
    document.body.innerHTML = '<div id="branch-journeys-top">Open in app</div><div id="branch-banner-iframe"></div>'
    removeMediumBanners()
    expect(document.getElementById('branch-journeys-top')).toBeNull()
    expect(document.getElementById('branch-banner-iframe')).toBeNull()
  })

  test('removes overlay elements', () => {
    document.body.innerHTML = '<div class="overlay overlay--lighter">Overlay</div>'
    removeMediumBanners()
    expect(document.querySelector('.overlay.overlay--lighter')).toBeNull()
  })

  test('removes legacy Medium selectors', () => {
    document.body.innerHTML =
      '<div class="js-stickyFooter">Footer</div>' +
      '<div class="metabar js-metabar">Metabar</div>' +
      '<div class="js-meterBanner">Banner</div>' +
      '<div class="postMeterBar">Meter</div>'
    removeMediumBanners()
    expect(document.querySelector('.js-stickyFooter')).toBeNull()
    expect(document.querySelector('.metabar.js-metabar')).toBeNull()
    expect(document.querySelector('.js-meterBanner')).toBeNull()
    expect(document.querySelector('.postMeterBar')).toBeNull()
  })

  test('removes privacy banner by walking up to body child', () => {
    document.body.innerHTML =
      '<div id="privacy-wrapper">' +
      '  <div><a href="https://policy.medium.com/medium-privacy-policy">Privacy</a></div>' +
      '</div>' +
      '<p>Article</p>'
    removeMediumBanners()
    expect(document.getElementById('privacy-wrapper')).toBeNull()
    expect(document.querySelector('p').textContent).toBe('Article')
  })

  test('does not remove page content when privacy link is inside a large container', () => {
    document.body.innerHTML =
      '<div id="root">' +
      '  <div id="content">' +
      '    <article>Article content</article>' +
      '    <footer>' +
      '      <div id="privacy-bar">' +
      '        <a href="https://policy.medium.com/medium-privacy-policy">Privacy</a>' +
      '      </div>' +
      '    </footer>' +
      '  </div>' +
      '</div>'
    // Mock getBoundingClientRect to simulate real layout sizes
    document.getElementById('root').getBoundingClientRect = () => ({ height: 5000 })
    document.getElementById('content').getBoundingClientRect = () => ({ height: 5000 })
    document.querySelector('footer').getBoundingClientRect = () => ({ height: 60 })
    document.getElementById('privacy-bar').getBoundingClientRect = () => ({ height: 60 })
    removeMediumBanners()
    expect(document.querySelector('article').textContent).toBe('Article content')
    expect(document.getElementById('root')).not.toBeNull()
    expect(document.getElementById('content')).not.toBeNull()
  })

  test('removes fixed-position top banners', () => {
    document.body.innerHTML = '<div id="fixed-top">Banner</div><p>Content</p>'
    const fixedEl = document.getElementById('fixed-top')
    mockGetComputedStyle.mockImplementation(el => {
      if (el === fixedEl) return { position: 'fixed' }
      return { position: 'static' }
    })
    fixedEl.getBoundingClientRect = () => ({ top: 0, bottom: 50, height: 50 })
    removeMediumBanners()
    expect(document.getElementById('fixed-top')).toBeNull()
  })

  test('removes sticky-position bottom banners', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true })
    document.body.innerHTML = '<div id="sticky-bottom">Subscribe</div>'
    const stickyEl = document.getElementById('sticky-bottom')
    mockGetComputedStyle.mockImplementation(el => {
      if (el === stickyEl) return { position: 'sticky' }
      return { position: 'static' }
    })
    stickyEl.getBoundingClientRect = () => ({ top: 700, bottom: 800, height: 100 })
    removeMediumBanners()
    expect(document.getElementById('sticky-bottom')).toBeNull()
  })

  test('does not remove non-fixed elements', () => {
    document.body.innerHTML = '<div id="keep">Keep me</div>'
    mockGetComputedStyle.mockReturnValue({ position: 'static' })
    document.getElementById('keep').getBoundingClientRect = () => ({ top: 0, bottom: 50, height: 50 })
    removeMediumBanners()
    expect(document.getElementById('keep')).not.toBeNull()
  })

  test('restores scrolling on document', () => {
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.innerHTML = '<div role="dialog">Modal</div>'
    removeMediumBanners()
    expect(document.documentElement.style.overflow).toBe('auto')
    expect(document.body.style.overflow).toBe('auto')
  })

  test('handles empty page gracefully', () => {
    document.body.innerHTML = '<p>Just content</p>'
    expect(() => removeMediumBanners()).not.toThrow()
    expect(document.querySelector('p').textContent).toBe('Just content')
  })

  test('removes multiple banner types at once', () => {
    document.body.innerHTML =
      '<nav>Nav</nav>' +
      '<div role="dialog">Modal</div>' +
      '<div role="alert">Alert</div>' +
      '<p>Content</p>'
    removeMediumBanners()
    expect(document.querySelector('nav')).toBeNull()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.querySelector('[role="alert"]')).toBeNull()
    expect(document.querySelector('p').textContent).toBe('Content')
  })
})
