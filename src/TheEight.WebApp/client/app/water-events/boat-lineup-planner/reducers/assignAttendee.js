export default (state, action) => {
    state.setIn(["attendees", action.payload.attendeeId, "placement", "boatKey"], action.payload.boatKey)
        .setIn(["attendees", action.payload.attendeeId, "placement", "seat"], action.payload.seatPosition);
};