import { handleActions } from "redux-actions"

import DetailsStateRecord from "../records/details-state.record"

const detailsStateReducer = handleActions({
  
}, new DetailsStateRecord())

export default detailsStateReducer
