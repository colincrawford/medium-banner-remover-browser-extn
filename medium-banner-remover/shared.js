/* global chrome, browser */

/**
 * Add some functional programming utilities to the global scope under the "_" object.
 */
// eslint-disable-next-line
const _ = (() => {
  /**
   * Functional wrapper over Array.map
   *
   * @param {(value: any, index: number) => any} fn
   * @returns {(arr: Array) => Array}
   */
  const map = fn => arr => arr.map(fn)

  /**
   * Functional wrapper over Array.filter
   *
   * @param {(value: any, index: number) => any} fn
   * @returns {(arr: Array) => Array}
   */
  const filter = fn => arr => arr.filter(fn)

  /**
   * Functional wrapper over Array.reduce
   *
   * @param {(acc: any, value: any, index: number) => any} fn
   * @returns {(arr: Array) => (initialValue: any) => Array}
   */
  const reduce = fn => arr => initialVal => arr.reduce(fn, initialVal)

  /**
   * Convert {value} into a boolean
   *
   * @param {any} value
   * @returns {boolean} Whether value is truthy
   */
  const isTruthy = value => !!value

  /**
   * Pipe a value through a series of functions, passing the incremental result to the next function in the pipeline
   *
   * @param {...((value: any) => any)} fns
   * @returns {any} The result of running an initial value through {fns} as a pipeline
   */
  const pipe = (...fns) => reduce((acc, nextFn) => nextFn(acc))(fns)

  /**
   * Get the first value of an array
   *
   * @param {Array} arr
   * @returns {any} - The first value of {arr}
   */
  const first = arr => arr[0]

  /**
   * Curried function to compare two values
   *
   * @param {any} v1
   * @returns {(v2: any) => boolean}
   */
  const eq = v1 => v2 => v1 === v2

  /**
   * Functional wrapper over an if statement with only a truthy branch. If {predicate} applied to {value}
   * evaluates to true, returns the result of {whenTrue} applied to {value} - otherwise just returns {undefined}
   *
   * @param {(value: any) => boolean} predicate
   * @returns {(whenTrue: (value: any) => void) => (value: any) => void}
   */
  const when = predicate => whenTrue => value => predicate(value) ? whenTrue(value) : undefined

  /**
   * Runs {handler} against a value if the value is truthy
   *
   * @param {(value: any) => any} handler
   * @returns The result of {handler} or undefined
   */
  const whenExists = when(isTruthy)

  /**
   * Run a function with some side effects on a value then return the value
   *
   * @param {(value: any) => void} fn - Callback with some side effect
   * @returns {(value: any) => any} The input value
   */
  const tap = fn => value => {
    fn(value)
    return value
  }

  /**
   * Takes a value and matches against [predicate, handlerFunction] tuples until it finds
   * a predicate that returns true; it then runs the matching handler with {value} and returns the result
   *
   * @param {[[(value: any) => boolean, (value: any) => any]]} handlerMap
   * @param {(value: any) => any} [defaultFn]
   * @returns {any}
   */
  const match = (handlerMap, defaultFn = () => {}) => value => {
    const handler = handlerMap.find(([predicate]) => predicate(value))
    return (handler ? handler[1] : defaultFn)(value)
  }

  /**
   * Just returns the argument
   *
   * @param {any} value
   * @returns {value}
   */
  const identity = value => value

  /** Functional wrapper around node.querySelector */
  const querySelector = selector => domNode => domNode.querySelector(selector)

  /** Functional wrapper around node.querySelectorAll */
  const querySelectorAll = selector => domNode => [...domNode.querySelectorAll(selector)]

  /** Functional wrapper around node.remove */
  const removeDomNode = domNode => domNode.remove()

  /** Functional wrapper around node.parentNode */
  const parentNode = domNode => domNode.parentNode

  /** Functional wrapper around node.on */
  const addEventListener = event => listener => domNode => domNode.addEventListener(event, listener)

  /**
   * Cross platform wrapper around the browser's storage.sync.get API
   *
   * @param {string} key
   * @returns {any} The value associated with {key} or {undefined}
   */
  function getFromStorage (key) {
    if (chrome) {
      return new Promise(resolve => chrome.storage.sync.get(key, v => resolve(v)))
    }
    if (browser) {
      return browser.storage.sync.get(key)
    }
    return Promise.resolve()
  }

  /**
   * Cross platform wrapper around the browser's storage.sync.set API
   *
   * @param {Object} keyValues - An object of keys to values to store
   * @returns {void}
   */
  function setInStorage (keyValues) {
    if (chrome) {
      return new Promise(resolve => chrome.storage.sync.set(keyValues, resolve))
    }
    if (browser) {
      return browser.storage.sync.set(keyValues)
    }
    return Promise.resolve()
  }

  /**
   * Cross platform wrapper around the browser's runtime.sendMessage API
   *
   * @param {object} message
   * @returns {void}
   */
  const sendMessageToTab = tab => message => {
    if (chrome) {
      return chrome.tabs.sendMessage(tab.id, message)
    } else if (browser) {
      return browser.tabs.sendMessage(tab.id, message)
    }
  }

  /**
   * Cross platform wrapper over the onMessage.addListener API
   * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage
   *
   * @param {(message) => void} cb
   * @returns {void}
   */
  const registerMessageListener = cb => {
    if (chrome) {
      return chrome.runtime.onMessage.addListener(cb)
    } else if (browser) {
      return browser.runtime.onMessage.addListener(cb)
    }
  }

  /**
   * Registers a cb with the browser to be run when the extension icon is clicked
   * (the extension icon is on the bar at the top of the browser)
   *
   * @param {(message: any) => void} cb
   * @returns {void}
   */
  const registerOnExtensionIconClicked = cb => {
    if (chrome) {
      return chrome.action.onClicked.addListener(cb)
    } else if (browser) {
      return browser.action.onClicked.addListener(cb)
    }
  }

  /**
   * Get the current active tab
   *
   * @returns {Promise} Current active tab
   */
  const getCurrentTab = () => {
    const queryOptions = { active: true, currentWindow: true }
    if (chrome) {
      return chrome.tabs.query(queryOptions).then(tabs => tabs[0])
    } else if (browser) {
      return browser.tabs.query(queryOptions).then(tabs => tabs[0])
    }
  }

  const APP_NAME = 'Banner Remover'
  const AUTO_RUN_STORAGE_KEY = 'AUTO_RUN'
  const CLEAR_BANNERS_MSG = 'CLEAR_BANNERS'

  const log = level => (...args) => console[level](`${APP_NAME} - [${level.toUpperCase()}] -`, ...args)
  const logInfo = log('info')
  const logError = log('error')

  return {
    map,
    filter,
    reduce,
    isTruthy,
    pipe,
    first,
    eq,
    tap,
    when,
    whenExists,
    match,
    identity,
    // DOM utils
    querySelector,
    querySelectorAll,
    removeDomNode,
    parentNode,
    addEventListener,
    // Browser API wrappers
    getFromStorage,
    setInStorage,
    sendMessageToTab,
    registerMessageListener,
    getCurrentTab,
    registerOnExtensionIconClicked,
    // Constants
    APP_NAME,
    AUTO_RUN_STORAGE_KEY,
    CLEAR_BANNERS_MSG,
    // logging
    logInfo,
    logError
  }
})()
