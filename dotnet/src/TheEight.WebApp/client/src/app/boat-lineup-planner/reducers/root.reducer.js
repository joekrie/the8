import { combineReducers } from "redux"

import detailsReducer from "./attendees.reducer"
import placementsReducer from "./boats.reducer"
import statusReducer from "./status.reducer"

const rootReducer = combineReducers({
  details: detailsReducer,
  placements: placementsReducer,
  status: statusReducer
})

export default rootReducer
