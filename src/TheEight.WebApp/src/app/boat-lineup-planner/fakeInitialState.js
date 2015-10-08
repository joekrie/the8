import Immutable from 'immutable';
import boatTypes from './constants/boatTypes';

export default Immutable.fromJS({
	unassignedAttendees: {
		'TeamMembers/103': {
			id: 'TeamMembers/103',
			sortName: 'Yealsalot, George',
			displayName: 'George Yealsalot',
			position: 'coxswain'
		},
		'TeamMembers/77': {
			id: 'TeamMembers/77',
			sortName: 'Earges, Jimmy',
			displayName: 'Jimmy Earges',
			position: 'rower'
		},
		'TeamMembers/31': {
			id: 'TeamMembers/31',
			sortName: 'Crabbs, Bill',
			displayName: 'Bill Crabbs',
			position: 'rower'
		},
		'TeamMembers/6': {
			id: 'TeamMembers/6',
			sortName: 'Whaker, Brig',
			displayName: 'Brig Whaker',
			position: 'coxswain'
		}
	},
	boats: {
		'boat-1': {
			key: 'boat-1',
			title: 'M2',
			type: boatTypes.FOUR,
			seats: {
				coxswain: {
					id: 'TeamMembers/17',
					sortName: 'Passem, Henry',
					displayName: 'Henry Passem',
					position: 'rower'
				},
				stroke: {
					id: 'TeamMembers/54',
					sortName: 'Rowerson, Mickey',
					displayName: 'Mickey Rowerson',
					position: 'rower'
				},
				2: null,
				3: null,
				bow: null
			}
		},
		'boat-2': {
			key: 'boat-2',
			title: 'Jaws',
			type: boatTypes.DOUBLE,
			seats: {
				stroke: null,
				bow: null
			}
		}
	}
});