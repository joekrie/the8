import Immutable from 'immutable';

export default function(boatType) {
	let seats = {};
	
	if (boatType.get('coxswain')) {
		seats.coxswain = null;
	}
	
	for (let i = 1; i <= boatType.get('rowers'); i++) {
		seats[String(i)] = null;
	}
	
	return Immutable.fromJS(seats);
}