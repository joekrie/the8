import { createAction } from 'redux-actions';

export default {
    assignAttendee: createAction('ASSIGN_ATTENDEE'),
    unassignAttendee: createAction('UNASSIGN_ATTENDEE')
};