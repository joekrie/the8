import { generateReducer, generateActionCreators } from "../common/reducerUtils";
import reducerFunctions from "./reducerFunctions";
import { Map } from "immutable";

export const defaultState = {
    settings: Map({
        allowMultipleAssignments: false
    }),
    attendees: Map(),
    boats: Map()
};

export const actionCreators = generateActionCreators(reducerFunctions);
export const reducer = generateReducer(reducerFunctions, defaultState);