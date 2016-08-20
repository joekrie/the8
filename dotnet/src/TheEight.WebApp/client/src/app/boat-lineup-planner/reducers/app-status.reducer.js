import { handleActions } from "redux-actions"

const attendeeReducer = handleActions({
  "SET_INITIAL_STATE": (prevState, action) => {
    return prevState.set("isInitialDataLoaded", true)
  }
}, {})

export default attendeeReducer
