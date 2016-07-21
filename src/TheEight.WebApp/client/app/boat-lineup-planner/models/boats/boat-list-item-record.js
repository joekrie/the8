import { Record, Map } from "immutable"

import BoatRecord from "./boat-record"

const defaults = {
  boat: new Record(),
  isSaving: false
}

export default class BoatListItemRecord extends Record(defaults) {
  
}
