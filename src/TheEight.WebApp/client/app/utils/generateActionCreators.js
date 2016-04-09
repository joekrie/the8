import { createAction } from "redux-actions";
import { mapValues } from "lodash";
import toUpperSnakeCase from "./toUpperSnakeCase";

export default reducers => 
    reducers.mapValues((key, value) => createAction(toUpperSnakeCase(value)));