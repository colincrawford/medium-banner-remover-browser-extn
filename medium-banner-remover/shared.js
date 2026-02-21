/* global chrome */

/**
 * Functional programming utilities and browser API wrappers.
 */
// eslint-disable-next-line
const _ = (() => {
  const map = fn => arr => arr.map(fn)
  const filter = fn => arr => arr.filter(fn)
  const reduce = fn => arr => initialVal => arr.reduce(fn, initialVal)
  const isTruthy = value => !!value
  const pipe = (...fns) => reduce((acc, nextFn) => nextFn(acc))(fns)
  const first = arr => arr[0]
  const eq = v1 => v2 => v1 === v2
  const when = predicate => whenTrue => value => predicate(value) ? whenTrue(value) : undefined
  const whenExists = when(isTruthy)
  const identity = value => value

  const tap = fn => value => {
    fn(value)
    return value
  }

  const match = (handlerMap, defaultFn = () => {}) => value => {
    const handler = handlerMap.find(([predicate]) => predicate(value))
    return (handler ? handler[1] : defaultFn)(value)
  }

  /** DOM utilities */
  const querySelector = selector => domNode => domNode.querySelector(selector)
  const querySelectorAll = selector => domNode => [...domNode.querySelectorAll(selector)]
  const removeDomNode = domNode => domNode.remove()
  const parentNode = domNode => domNode.parentNode
  const addEventListener = event => listener => domNode => domNode.addEventListener(event, listener)

  /** Browser API wrappers - MV3 chrome.* APIs return promises natively */
  const getFromStorage = key => chrome.storage.sync.get(key)
  const setInStorage = keyValues => chrome.storage.sync.set(keyValues)

  const sendMessageToTab = tab => message => chrome.tabs.sendMessage(tab.id, message)

  const registerMessageListener = cb => chrome.runtime.onMessage.addListener(cb)

  const registerOnExtensionIconClicked = cb => chrome.action.onClicked.addListener(cb)

  const getCurrentTab = () => chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => tabs[0])

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
    querySelector,
    querySelectorAll,
    removeDomNode,
    parentNode,
    addEventListener,
    getFromStorage,
    setInStorage,
    sendMessageToTab,
    registerMessageListener,
    getCurrentTab,
    registerOnExtensionIconClicked,
    APP_NAME,
    AUTO_RUN_STORAGE_KEY,
    CLEAR_BANNERS_MSG,
    logInfo,
    logError
  }
})()
