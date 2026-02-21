const fs = require('fs')
const path = require('path')

/**
 * Load a browser extension script into the global scope.
 *
 * Extension scripts use top-level `const` declarations that become globals
 * in the browser but are module-scoped in Node.js. This helper reads the
 * source, converts the top-level declaration to a global assignment, and
 * executes it.
 */
function loadScript (filePath) {
  const absPath = path.resolve(__dirname, '..', filePath)
  let code = fs.readFileSync(absPath, 'utf8')

  // Strip `/* global ... */` comments (not needed in Node)
  code = code.replace(/\/\* global .* \*\/\n?/g, '')

  // Strip `self.importScripts(...)` calls (service worker API, not available in Node)
  code = code.replace(/self\.importScripts\(.*\)\n?/g, '')

  // Convert top-level const/let declarations to global assignments
  // e.g. `const _ = (...)` → `global._ = (...)`
  // Only targets declarations at column 0 (file-level), not indented ones
  code = code.replace(/^\/\/ eslint-disable-next-line\n/gm, '')
  code = code.replace(/^const (\w+) =/gm, 'global.$1 =')

  // eslint-disable-next-line no-new-func
  new Function(code)()
}

module.exports = { loadScript }
