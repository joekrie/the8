import { takeEvery } from "redux-saga"
import { fork } from "redux-saga/effects"

import moveAttendees from "./attendees/move-attendees"

export default function *rootSaga() {
  yield fork(takeEvery, "MOVE_ATTENDEES_REQUEST", moveAttendees)
}