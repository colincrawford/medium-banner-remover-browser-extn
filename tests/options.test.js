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

describe('options.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'info').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()

    document.body.innerHTML =
      '<form>' +
      '  <input type="checkbox" id="auto-run" />' +
      '  <button type="submit">Save</button>' +
      '</form>'
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('sets checkbox from storage on load', async () => {
    chrome.storage.sync.get.mockResolvedValue({ AUTO_RUN: true })

    loadScript('medium-banner-remover/options/options.js')
    document.dispatchEvent(new Event('DOMContentLoaded'))

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(chrome.storage.sync.get).toHaveBeenCalledWith('AUTO_RUN')
    expect(document.getElementById('auto-run').checked).toBe(true)
  })

  test('checkbox is unchecked when storage has no AUTO_RUN', async () => {
    chrome.storage.sync.get.mockResolvedValue({})

    loadScript('medium-banner-remover/options/options.js')
    document.dispatchEvent(new Event('DOMContentLoaded'))

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(document.getElementById('auto-run').checked).toBe(false)
  })

  test('saves checkbox state on form submit', async () => {
    chrome.storage.sync.get.mockResolvedValue({ AUTO_RUN: false })
    chrome.storage.sync.set.mockResolvedValue(undefined)

    loadScript('medium-banner-remover/options/options.js')
    document.dispatchEvent(new Event('DOMContentLoaded'))

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    // Check the box and submit
    document.getElementById('auto-run').checked = true
    const form = document.querySelector('form')
    form.dispatchEvent(new Event('submit'))

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ AUTO_RUN: true })
  })

  test('form submit prevents default', async () => {
    chrome.storage.sync.get.mockResolvedValue({})
    chrome.storage.sync.set.mockResolvedValue(undefined)

    loadScript('medium-banner-remover/options/options.js')
    document.dispatchEvent(new Event('DOMContentLoaded'))

    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    const event = new Event('submit', { cancelable: true })
    const form = document.querySelector('form')
    form.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })
})
