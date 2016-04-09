import { handleActions } from "redux-actions";

export default (actionReducers, defaultState) => {
    const reduceCb = (result, item) => result[item.actionType] = item.reducer;
    const actions = actionReducers.reduce(reduceCb, {});
    return handleActions(actions, defaultState);
};
