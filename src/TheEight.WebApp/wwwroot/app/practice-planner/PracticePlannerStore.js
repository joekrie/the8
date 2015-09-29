import actions from 'actions';

export default class PracticePlannerStore {
	constructor(data, onDataChange) {
		this.data = data;
		this.onDataChange = onDataChange;		
		this.actions = {};
		
		this.actions[actions.ASSIGN] = (attendee, boatKey, position) => {
			const newBoats = this.data.boats
				.setIn([boatKey, 'seats', position], attendee);
				
			const newUnassigned = this.data.unassignedAttendees
				.delete(attendee.get('id'));
			
			this.onDataChange('boats', newBoats);
			this.onDataChange('unassignedAttendees', newUnassigned);
		};
		
		this.actions[actions.UNASSIGN] = (attendee, oldBoatKey, oldPosition) => {
			const newBoats = this.data.boats
				.setIn([oldBoatKey, 'seats', oldPosition], null);
				
			const newUnassigned = this.data.unassignedAttendees
				.set(attendee.get('id'), attendee);
				
			this.onDataChange('boats', newBoats);
			this.onDataChange('unassignedAttendees', newUnassigned);
		};
		
		this.actions[actions.MOVE] = (newAttendee, oldBoatKey, oldPosition, newBoatKey, newPosition) => {
			const oldAttendee = this.data.boats.getIn([newBoatKey, 'seats', newPosition]);
			
			const newBoats = this.data.boats
				.setIn([oldBoatKey, 'seats', oldPosition], oldAttendee)
				.setIn([newBoatKey, 'seats', newPosition], newAttendee);
				
			this.onDataChange('boats', newBoats);
		};
	}
}