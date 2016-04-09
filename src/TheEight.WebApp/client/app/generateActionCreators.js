import { createAction } from "redux-actions";

export default actionReducers => 
    actionReducers.reduce((result, item) => result[item.actionCreatorName] = createAction(item.actionType));