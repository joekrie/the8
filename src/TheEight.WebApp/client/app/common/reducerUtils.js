import { handleActions, createAction } from "redux-actions";
import { mapKeys, mapValues, capitalize, snakeCase } from "lodash";

const toUpperSnakeCase = input => capitalize(snakeCase(input));

export const generateReducer = (reducers, defaultState) => handleActions(
    mapKeys(reducers, key => toUpperSnakeCase(key)),
    defaultState
);

export const generateActionCreators = reducers => 
    mapValues(reducers, (key, value) => createAction(toUpperSnakeCase(value)));