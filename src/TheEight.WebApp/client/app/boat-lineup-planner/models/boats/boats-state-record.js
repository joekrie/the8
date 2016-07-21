import { Record, Map } from "immutable"

const defaults = {
  boats: Map(),
  isLoaded: false,
  isLoading: false
}

export default class BoatsStateRecord extends Record(defaults) {
  
}
