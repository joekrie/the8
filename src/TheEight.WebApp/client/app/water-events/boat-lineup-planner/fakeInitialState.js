import Immutable from "immutable";
import boatTypes from "./constants/boatTypes";
import attendeePositions from "./constants/attendeePositions";
import emptyAttendeePlacement from "./constants/emptyAttendeePlacement";

export default Immutable.fromJS({
	attendees: {
		'TeamMembers/103': {
			teamMember: {
				id: "TeamMembers/103",
				sortName: "Yealsalot, George",
				displayName: "George Yealsalot",
				position: attendeePositions.COXSWAIN
			},			
			placement: emptyAttendeePlacement
		},
		'TeamMembers/77': {
			teamMember: {
				id: "TeamMembers/77",
				sortName: "Earges, Jimmy",
				displayName: "Jimmy Earges",
				position: attendeePositions.ROWER
			},
			placement: emptyAttendeePlacement
		},
		'TeamMembers/31': {
			teamMember: {
				id: "TeamMembers/31",
				sortName: "Crabbs, Bill",
				displayName: "Bill Crabbs",
				position: attendeePositions.ROWER
			},
			placement: emptyAttendeePlacement
		},
		'TeamMembers/6': {
			teamMember: {
				id: "TeamMembers/6",
				sortName: "Whaker, Brig",
				displayName: "Brig Whaker",
				position: attendeePositions.COXSWAIN
			},
			placement: emptyAttendeePlacement
		},
		'TeamMembers/17': {
			teamMember: {
				id: "TeamMembers/17",
				sortName: "Passem, Henry",
				displayName: "Henry Passem",
				position: attendeePositions.ROWER
			},
			placement: {
				boatKey: "boat-1",
				seat: "coxswain"
			}
		},
		'TeamMembers/54': {
			teamMember: {
				id: "TeamMembers/54",
				sortName: "Rowerson, Mickey",
				displayName: "Mickey Rowerson",
				position: attendeePositions.ROWER
			},
			placement: {
				boatKey: "boat-1",
				seat: "2"
			}
		}
	},
	boats: {
		'boat-1': {
			title: "M2",
			type: boatTypes.FOUR
		},
		'boat-2': {
			title: "Jaws",
			type: boatTypes.DOUBLE
		}
	}
});