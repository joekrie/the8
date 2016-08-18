import { handleActions } from "redux-actions"

import BoatsStateRecord from "../records/boats-state.record"

const boatsReducer = handleActions({

}, new BoatsStateRecord())

export default boatsReducer
