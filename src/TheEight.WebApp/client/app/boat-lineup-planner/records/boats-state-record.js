import { Record, List, fromJS } from "immutable"

const defaults = {
  boats: List()
}

export default class BoatsStateRecord extends Record(defaults) {
  static createFromServerData(serverData) {
    const reviver = () => {
      
    }

    fromJS(serverData, reviver)
  }
}
