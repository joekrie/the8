import Immutable from "immutable";

export default (state, action) => {
    const emptyAttendeePlacement = Immutable.fromJS({
        boatKey: "",
        seat: ""
    });

    state.setIn(["attendees", action.payload.attendeeId, "placement"], emptyAttendeePlacement);
};