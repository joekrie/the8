const newBoats = this.data.boats
	.setIn([boatKey, 'seats', position], attendee);
	
const newUnassigned = this.data.unassignedAttendees
	.delete(attendee.get('id'));

this.onDataChange('boats', newBoats);
this.onDataChange('unassignedAttendees', newUnassigned);