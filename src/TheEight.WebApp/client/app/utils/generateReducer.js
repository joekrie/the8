import { handleActions } from "redux-actions";
import { mapKeys } from "lodash";
import toUpperSnakeCase from "./toUpperSnakeCase";

export default (reducers, defaultState) => handleActions(
    reducers.mapKeys(key => toUpperSnakeCase(key)),
    defaultState
);