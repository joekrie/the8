import Immutable from "immutable";

function getSeatLabel(seatPosition, boatType) {
    if (seatPosition === "COXSWAIN") {
        return "Coxswain";
    }
	
    if (seatPosition == 1) {
        return "Bow";
    }
	
    if (seatPosition === boatType.get("rowers")) {
        return "Stroke";
    }
	
    return String(seatPosition);
}

export default function(boatType) {
	let seats = {};
	
	if (boatType.get("coxswain")) {
		seats.coxswain = {
			attendee: null,
			label: getSeatLabel("COXSWAIN", boatType)
		};
	}
	
	for (let i = 1; i <= boatType.get("rowers"); i++) {
		seats[String(i)] = {
			attendee: null,
			label: getSeatLabel(i, boatType)
		};
	}
	
	return Immutable
        .fromJS(seats)
        .sortBy((seat, seatKey) => seatKey === "COXSWAIN" ? 0 : Number(seatKey));
}