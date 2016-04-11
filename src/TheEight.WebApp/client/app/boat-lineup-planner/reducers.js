import { generateReducer, generateActionCreators } from "../common/reducerUtils";
import { Map } from "immutable";

export const defaultState = {
    settings: Map({
        allowMultipleAssignments: false
    }),
    attendees: Map(),
    boats: Map()
};

const unassignAttendee = (prevState, action) => {
    const { boatId, seat } = action.payload.previousPlacement;

    return {
        ...prevState,
        boats: prevState.boats.deleteIn([boatId, "seatAssignments", seat])
    };
};

const assignAttendee = (prevState, action) => {
    const { nextPlacement, attendeeId } = action.payload;
    const { boatId, seat } = nextPlacement;

    return {
        ...prevState,
        boats: prevState.boats.setIn([boatId, "seatAssignments", seat], attendeeId)
    };
};

const replaceState = (prevState, action) => action.payload.state;

export const reducerFunctions = {
    assignAttendee,
    unassignAttendee,
    replaceState
};

export const actionCreators = generateActionCreators(reducerFunctions);
export const reducer = generateReducer(reducerFunctions, defaultState);