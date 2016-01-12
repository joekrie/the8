import { createAction, handleActions } from "redux-actions";
import { transform } from "lodash";

export default class {
    constructor () {
        this.registeredReducers = {};
        this.defaultState = {};
    }

    setDefaultState(state) {
        this.defaultState = state;
    }

    registerReducer(key, reducer, payloadCreator = null) {
        this.registeredReducers[key] = { reducer, payloadCreator };
    }

    getActionCreators() {
        const actions = Object.create(this.registeredReducers);

        transform(actions, (accum, val, key) => {
            accum[key] = createAction(key, val.payloadCreator);
        });

        return actions;
    }

    getReducer() {        
        const reducers = Object.create(this.registeredReducers);

        transform(reducers, (accum, val, key) => {
            accum[key] = val.reducer;
        });
        return handleActions(reducers, this.defaultState);
    }
};