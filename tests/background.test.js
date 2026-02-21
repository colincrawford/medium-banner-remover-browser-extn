/* eslint-env jest */
const { loadScript } = require('./helpers')

// Mock chrome APIs
global.chrome = {
  storage: { sync: { get: jest.fn(), set: jest.fn() } },
  tabs: { query: jest.fn(), sendMessage: jest.fn() },
  runtime: { onMessage: { addListener: jest.fn() } },
  action: { onClicked: { addListener: jest.fn() } }
}

// Mock self.importScripts (used in service workers)
global.self = { importScripts: jest.fn() }

// Load shared.js to set up global `_`
loadScript('medium-banner-remover/shared.js')

describe('background.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'info').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('registers an extension icon click listener', () => {
    loadScript('medium-banner-remover/background/background.js')
    expect(chrome.action.onClicked.addListener).toHaveBeenCalled()
  })

  test('on icon click, gets current tab and sends CLEAR_BANNERS message', async () => {
    const mockTab = { id: 42 }
    chrome.tabs.query.mockResolvedValue([mockTab])
    chrome.tabs.sendMessage.mockResolvedValue(undefined)

    let clickHandler
    chrome.action.onClicked.addListener.mockImplementation(cb => { clickHandler = cb })

    loadScript('medium-banner-remover/background/background.js')

    // Invoke the click handler
    clickHandler()

    // Wait for the promise chain to resolve
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true })
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(42, 'CLEAR_BANNERS')
  })
})
