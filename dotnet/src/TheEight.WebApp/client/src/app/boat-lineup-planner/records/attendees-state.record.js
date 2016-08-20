import { Record, List, Map, fromJS } from "immutable"

const defaults = {
  attendees: Map()
}

export default class BoatsStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    const reviver = () => {

    }

    fromJS(serverData, reviver)
  }

  
}