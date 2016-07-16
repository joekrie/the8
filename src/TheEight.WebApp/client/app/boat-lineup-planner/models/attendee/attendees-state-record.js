import { Record, List } from "immutable"

const defaults = {
  attendees: List(),
  isLoaded: false,
  isLoading: false,
  loadingErrorMessage: null
}

export default class AttendeesStateRecord extends Record(defaults) {}
