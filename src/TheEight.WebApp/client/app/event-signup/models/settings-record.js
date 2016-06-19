import { Record } from "immutable"
import { LocalDate } from "js-joda"

const SettingsRecord = Record({
  showRegisteredAttendees: true,
  attendeeId: ""
});

export default SettingsRecord