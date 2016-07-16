import { Map } from "immutable"

import BoatStateRecord from "./event-details-record"

const defaults = {
  boats: Map(),
  isLoaded: false,
  isLoading: false
}

export default class BoatStateRecord extends Record(defaults) {
  
}
