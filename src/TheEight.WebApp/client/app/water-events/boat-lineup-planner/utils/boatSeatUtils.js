import Immutable from 'immutable';
import coxswainSeatPosition from '../constants/coxswainSeatPosition';

export function createBoatSeats(boatType) {
	let seats = {};
	
	if (boatType.get('coxswain')) {
		seats.coxswain = {
			attendee: null,
			label: getSeatLabel(coxswainSeatPosition, boatType)
		};
	}
	
	for (let i = 1; i <= boatType.get('rowers'); i++) {
		seats[String(i)] = {
			attendee: null,
			label: getSeatLabel(i, boatType)
		};
	}
	
	return Immutable
        .fromJS(seats)
        .sortBy((seat, seatKey) => seatKey === 'coxswain' ? 0 : Number(seatKey));
}

function getSeatLabel(seatPosition, boatType) {
	if (seatPosition === coxswainSeatPosition) {
		return 'Coxswain';
	}
	
	if (seatPosition == 1) {
		return 'Bow';
	}
	
	if (seatPosition == boatType.get('rowers')) {
		return 'Stroke';
	}
	
	return String(seatPosition);
}

export function seatIsEmpty(seat) {
	return !Boolean(seat.get('attendee'))
}