import { createAction } from 'redux-actions';
import * as actionTypes from './actionTypes';

export const assignAttendee = createAction(actionTypes.ASSIGN_ATTENDEE);
export const unassignAttendee = createAction(actionTypes.UNASSIGN_ATTENDEE);