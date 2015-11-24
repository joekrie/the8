import ActionHandlerBuilder from '../../common/ActionHandlerBuilder';
import * as actionTypes from './actionTypes';
import emptyState from '../defaults/emptyState';
import emptyAttendeePlacement from '../defaults/emptyAttendeePlacement';

const builder = new ActionHandlerBuilder()
    .setDefaultState(emptyState)
    .registerReducer(actionTypes.ASSIGN_ATTENDEE, (state, action) =>
        state.setIn(['attendees', action.payload.attendeeId, 'placement', 'boatKey'], action.payload.boatKey)
            .setIn(['attendees', action.payload.attendeeId, 'placement', 'seat'], action.payload.seatPosition)
    )
    .registerReducer(actionTypes.UNASSIGN_ATTENDEE, (state, action) =>
        state.setIn(['attendees', action.payload.attendeeId, 'placement'], emptyAttendeePlacement)
    );

export default builder.build();