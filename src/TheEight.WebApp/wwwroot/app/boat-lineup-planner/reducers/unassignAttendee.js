const newBoats = this.data.boats
	.setIn([oldBoatKey, 'seats', oldPosition], null);
	
const newUnassigned = this.data.unassignedAttendees
	.set(attendee.get('id'), attendee);
	
this.onDataChange('boats', newBoats);
this.onDataChange('unassignedAttendees', newUnassigned);