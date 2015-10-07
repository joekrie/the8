import actions from 'actions';

export default class PracticePlannerStore {
	constructor(getData, onDataChange) {
		this.getData = getData;
		this.onDataChange = onDataChange;		
		this.actions = {};
		
		this.actions[actions.ASSIGN] = (attendee, boatKey, position) => {

		};
		
		this.actions[actions.UNASSIGN] = (attendee, oldBoatKey, oldPosition) => {

		};
		
		this.actions[actions.MOVE] = (newAttendee, oldBoatKey, oldPosition, newBoatKey, newPosition) => {

		};
	}
}