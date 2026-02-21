/* eslint-env jest */
const { loadScript } = require('./helpers')

// Mock chrome APIs
global.chrome = {
  storage: { sync: { get: jest.fn(), set: jest.fn() } },
  tabs: { query: jest.fn(), sendMessage: jest.fn() },
  runtime: { onMessage: { addListener: jest.fn() } },
  action: { onClicked: { addListener: jest.fn() } }
}

// Load shared.js to set up global `_`
loadScript('medium-banner-remover/shared.js')

// Mock removeMediumBanners as a global (loaded via content script ordering)
global.removeMediumBanners = jest.fn()

// Mock MutationObserver
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()
global.MutationObserver = jest.fn(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect
}))

describe('content-script.js', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
    document.body.innerHTML = '<div>Content</div>'
    jest.spyOn(console, 'info').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  test('registers a message listener on load', () => {
    chrome.storage.sync.get.mockResolvedValue({})
    loadScript('medium-banner-remover/content-scripts/content-script.js')
    expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled()
  })

  test('message listener calls removeMediumBanners for CLEAR_BANNERS message', () => {
    chrome.storage.sync.get.mockResolvedValue({})
    let messageHandler
    chrome.runtime.onMessage.addListener.mockImplementation(cb => { messageHandler = cb })
    loadScript('medium-banner-remover/content-scripts/content-script.js')

    messageHandler('CLEAR_BANNERS')
    expect(removeMediumBanners).toHaveBeenCalled()
  })

  test('auto-runs banner removal when AUTO_RUN is set', async () => {
    chrome.storage.sync.get.mockResolvedValue({ AUTO_RUN: true })
    loadScript('medium-banner-remover/content-scripts/content-script.js')

    // Flush the promise chain
    await Promise.resolve()
    await Promise.resolve()

    expect(removeMediumBanners).toHaveBeenCalled()
  })

  test('sets up MutationObserver when AUTO_RUN is set', async () => {
    chrome.storage.sync.get.mockResolvedValue({ AUTO_RUN: true })
    loadScript('medium-banner-remover/content-scripts/content-script.js')

    await Promise.resolve()
    await Promise.resolve()

    expect(MutationObserver).toHaveBeenCalled()
    expect(mockObserve).toHaveBeenCalledWith(document.body, { childList: true, subtree: true })
  })

  test('does not auto-run when AUTO_RUN is not set', async () => {
    chrome.storage.sync.get.mockResolvedValue({})
    loadScript('medium-banner-remover/content-scripts/content-script.js')

    await Promise.resolve()
    await Promise.resolve()

    expect(removeMediumBanners).not.toHaveBeenCalled()
    expect(MutationObserver).not.toHaveBeenCalled()
  })

  test('disconnects observer after 30 seconds', async () => {
    chrome.storage.sync.get.mockResolvedValue({ AUTO_RUN: true })
    loadScript('medium-banner-remover/content-scripts/content-script.js')

    await Promise.resolve()
    await Promise.resolve()

    expect(mockDisconnect).not.toHaveBeenCalled()
    jest.advanceTimersByTime(30000)
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
