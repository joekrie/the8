import { handleActions } from 'redux-actions';


export default class {
    constructor() {
        this.defaultState = {};
        this.reducers = {};
    }

    setDefaultState(state) {
        this.defaultState = state;
        return this;
    }

    registerReducer(name, reducer) {
        this.reducers[name] = reducer;
        return this;
    }

    build() {
        return handleActions(this.reducers, this.defaultState);
    }
}