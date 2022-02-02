/* global _ */

const main = () => {
  const AUTO_RUN_CHECKBOX_SELECTOR = '#auto-run'

  const getAutoRunFromStorage = () => _.getFromStorage(_.AUTO_RUN_STORAGE_KEY)
    .then(obj => _.isTruthy(obj[_.AUTO_RUN_STORAGE_KEY]))
  const setAutoRunInStorage = autoRun => _.setInStorage({ [_.AUTO_RUN_STORAGE_KEY]: autoRun })

  const getAutoRunCheckbox = _.querySelector(AUTO_RUN_CHECKBOX_SELECTOR)
  const getAutoRunCheckboxValue = () => getAutoRunCheckbox(document).checked
  const setAutoRunCheckbox = checked => {
    getAutoRunCheckbox(document).checked = checked
  }

  const handleFormSubmit = e => {
    setAutoRunInStorage(getAutoRunCheckboxValue())
    e.preventDefault()
  }

  const listenForFormSubmit = _.pipe(
    _.querySelector('form'),
    _.addEventListener('submit')(handleFormSubmit)
  )

  getAutoRunFromStorage()
    .then(setAutoRunCheckbox)
    .then(() => listenForFormSubmit(document))
    .catch(error => _.logError('Error in options.js', error))
}

_.addEventListener('DOMContentLoaded')(main)(document)
