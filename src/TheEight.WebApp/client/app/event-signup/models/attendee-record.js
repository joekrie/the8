import { Record } from "immutable";

import { BISWEPTUAL_ROWER, COXSWAIN } from "./attendee-positions";

const defaults = {
  attendeeId: "",
  displayName: "",
  sortName: "",
  position: BISWEPTUAL_ROWER
};

export default class AttendeeRecord extends Record(defaults) {
  get isCoxswain() {
    return this.position === COXSWAIN;
  }
}