import { Map } from "immutable"

const defaults = {
  boats: Map(),
  isLoaded: false,
  isLoading: false
}

export default class BoatStateRecord extends Record(defaults) {
  
}
