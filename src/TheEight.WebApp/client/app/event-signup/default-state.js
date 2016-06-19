import { List, Map } from "immutable"
import { LocalDate } from "js-joda"

import SettingsRecord from "./models/settings-record"

const sampleState = {
  settings: new SettingsRecord(),
  events: List()
};

export default sampleState;