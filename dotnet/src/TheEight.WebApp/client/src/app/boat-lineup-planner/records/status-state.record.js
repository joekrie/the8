import { Record, List, Map, fromJS } from "immutable"

const defaults = {
  isLoaded: false,
  loadingErrorMessage: ""
}

export default class StatusStateRecord extends Record(defaults) {
  get didLoadingError() {
    return Boolean(this.loadingErrorMessage)
  }
}
