import { takeEvery, takeLatest } from "redux-saga"
import { put, call } from "redux-saga/effects"

import AttendeesActionTypes from "boat-lineup-planner/actions/attendees/action-types"

function x() { 
  actions => dispatch => {
    const postBody = {
      assignments: [],
      unassignments: []
    }

    actions.forEach(action => {
      if (action.type === "ASSIGN_ATTENDEE") {
        postBody.assignments.push(action.payload)
      }

      if (action.type === "UNASSIGN_ATTENDEE") {
        postBody.unassignments.push(action.payload)
      }
    })

    fetch("/move-attendees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify(postBody)
    }).then(() => {
      actions.forEach(dispatch)
      dispatch(moveAttendeesSuccess())
    }).catch(err => {
      dispatch(moveAttendeesError(err))
    })
  }
}

function* moveAttendees(action) {
  try {
    const user = yield call(x, action.payload.userId);

    yield put({
      type: "MOVE_ATTENDEES_SUCCESS", 
      user: user
    })
  } catch (error) {
    yield put({
      type: "MOVE_ATTENDEES_ERROR", 
      message: error.message
    })
  }
}

function* mySaga() {
  yield* takeLatest("MOVE_ATTENDEES_REQUEST", fetchUser);
}
