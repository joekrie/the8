export function attendeeIsPlaced(attendee) {
	return Boolean(attendee.getIn(['placement', 'boatKey']));
}