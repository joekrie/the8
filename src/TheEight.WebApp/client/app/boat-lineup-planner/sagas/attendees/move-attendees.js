import { takeEvery, takeLatest } from "redux-saga"
import { put, call } from "redux-saga/effects"

export function saveAttendeeMoves(payload) { 
  return fetch("/move-attendees", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify(payload)
  })
}

export default function* moveAttendees(action) {
  try {
    yield call(saveAttendeeMoves, action.payload)

    yield put({
      type: "MOVE_ATTENDEES_SUCCESS"
    })
  } catch (error) {
    yield put({
      type: "MOVE_ATTENDEES_ERROR", 
      payload: error,
      error: true
    })
  }
}
