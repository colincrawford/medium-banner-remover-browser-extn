/* eslint-env jest */
const { loadScript } = require('./helpers')

// Mock the chrome API before loading shared.js
global.chrome = {
  storage: { sync: { get: jest.fn(), set: jest.fn() } },
  tabs: { query: jest.fn(), sendMessage: jest.fn() },
  runtime: { onMessage: { addListener: jest.fn() } },
  action: { onClicked: { addListener: jest.fn() } }
}

loadScript('medium-banner-remover/shared.js')

describe('shared.js', () => {
  describe('functional utilities', () => {
    test('map applies function over array', () => {
      const double = x => x * 2
      expect(_.map(double)([1, 2, 3])).toEqual([2, 4, 6])
    })

    test('filter keeps matching elements', () => {
      const isEven = x => x % 2 === 0
      expect(_.filter(isEven)([1, 2, 3, 4])).toEqual([2, 4])
    })

    test('reduce accumulates values', () => {
      const sum = (acc, x) => acc + x
      expect(_.reduce(sum)([1, 2, 3])(0)).toBe(6)
    })

    test('isTruthy returns correct boolean', () => {
      expect(_.isTruthy(1)).toBe(true)
      expect(_.isTruthy('hello')).toBe(true)
      expect(_.isTruthy(0)).toBe(false)
      expect(_.isTruthy(null)).toBe(false)
      expect(_.isTruthy(undefined)).toBe(false)
      expect(_.isTruthy('')).toBe(false)
    })

    test('pipe composes functions left to right', () => {
      const add1 = x => x + 1
      const double = x => x * 2
      const composed = _.pipe(add1, double)
      expect(composed(5)).toBe(12)
    })

    test('first returns first element', () => {
      expect(_.first([10, 20, 30])).toBe(10)
    })

    test('eq performs strict equality', () => {
      expect(_.eq(5)(5)).toBe(true)
      expect(_.eq(5)(6)).toBe(false)
      expect(_.eq('a')('a')).toBe(true)
    })

    test('tap calls function and returns value', () => {
      const spy = jest.fn()
      const result = _.tap(spy)('hello')
      expect(spy).toHaveBeenCalledWith('hello')
      expect(result).toBe('hello')
    })

    test('identity returns the value unchanged', () => {
      expect(_.identity(42)).toBe(42)
      expect(_.identity('test')).toBe('test')
    })

    test('when calls whenTrue only if predicate passes', () => {
      const isPositive = x => x > 0
      const double = x => x * 2
      const doubleIfPositive = _.when(isPositive)(double)
      expect(doubleIfPositive(5)).toBe(10)
      expect(doubleIfPositive(-1)).toBeUndefined()
    })

    test('whenExists calls function only for truthy values', () => {
      const fn = jest.fn(x => x + '!')
      expect(_.whenExists(fn)('hello')).toBe('hello!')
      expect(_.whenExists(fn)(null)).toBeUndefined()
    })

    test('match finds and executes matching handler', () => {
      const isA = x => x === 'a'
      const isB = x => x === 'b'
      const handler = _.match([
        [isA, () => 'matched A'],
        [isB, () => 'matched B']
      ])
      expect(handler('a')).toBe('matched A')
      expect(handler('b')).toBe('matched B')
    })

    test('match falls back to default when no match', () => {
      const handler = _.match([], () => 'default')
      expect(handler('anything')).toBe('default')
    })
  })

  describe('DOM utilities', () => {
    test('querySelector finds element', () => {
      document.body.innerHTML = '<div id="test">Hello</div>'
      const el = _.querySelector('#test')(document)
      expect(el.textContent).toBe('Hello')
    })

    test('querySelectorAll finds all matching elements', () => {
      document.body.innerHTML = '<ul><li>A</li><li>B</li><li>C</li></ul>'
      const items = _.querySelectorAll('li')(document)
      expect(items).toHaveLength(3)
      expect(items[0].textContent).toBe('A')
    })

    test('removeDomNode removes element from DOM', () => {
      document.body.innerHTML = '<div id="target">Remove me</div>'
      const el = document.getElementById('target')
      _.removeDomNode(el)
      expect(document.getElementById('target')).toBeNull()
    })

    test('parentNode returns parent', () => {
      document.body.innerHTML = '<div id="parent"><span id="child"></span></div>'
      const child = document.getElementById('child')
      const parent = _.parentNode(child)
      expect(parent.id).toBe('parent')
    })

    test('addEventListener attaches event listener', () => {
      document.body.innerHTML = '<button id="btn">Click</button>'
      const btn = document.getElementById('btn')
      const handler = jest.fn()
      _.addEventListener('click')(handler)(btn)
      btn.click()
      expect(handler).toHaveBeenCalled()
    })
  })

  describe('Chrome API wrappers', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    test('getFromStorage calls chrome.storage.sync.get', () => {
      chrome.storage.sync.get.mockResolvedValue({ key: 'value' })
      _.getFromStorage('key')
      expect(chrome.storage.sync.get).toHaveBeenCalledWith('key')
    })

    test('setInStorage calls chrome.storage.sync.set', () => {
      _.setInStorage({ key: 'value' })
      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ key: 'value' })
    })

    test('sendMessageToTab sends message to correct tab', () => {
      const tab = { id: 42 }
      _.sendMessageToTab(tab)('hello')
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(42, 'hello')
    })

    test('registerMessageListener registers listener', () => {
      const cb = jest.fn()
      _.registerMessageListener(cb)
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledWith(cb)
    })

    test('registerOnExtensionIconClicked registers listener', () => {
      const cb = jest.fn()
      _.registerOnExtensionIconClicked(cb)
      expect(chrome.action.onClicked.addListener).toHaveBeenCalledWith(cb)
    })

    test('getCurrentTab queries for active tab', async () => {
      const mockTab = { id: 1, url: 'https://medium.com' }
      chrome.tabs.query.mockResolvedValue([mockTab])
      const tab = await _.getCurrentTab()
      expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true })
      expect(tab).toEqual(mockTab)
    })
  })

  describe('constants', () => {
    test('APP_NAME is defined', () => {
      expect(_.APP_NAME).toBe('Banner Remover')
    })

    test('AUTO_RUN_STORAGE_KEY is defined', () => {
      expect(_.AUTO_RUN_STORAGE_KEY).toBe('AUTO_RUN')
    })

    test('CLEAR_BANNERS_MSG is defined', () => {
      expect(_.CLEAR_BANNERS_MSG).toBe('CLEAR_BANNERS')
    })
  })

  describe('logging', () => {
    test('logInfo logs with info level', () => {
      const spy = jest.spyOn(console, 'info').mockImplementation()
      _.logInfo('test message')
      expect(spy).toHaveBeenCalledWith('Banner Remover - [INFO] -', 'test message')
      spy.mockRestore()
    })

    test('logError logs with error level', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation()
      _.logError('error message')
      expect(spy).toHaveBeenCalledWith('Banner Remover - [ERROR] -', 'error message')
      spy.mockRestore()
    })
  })
})
