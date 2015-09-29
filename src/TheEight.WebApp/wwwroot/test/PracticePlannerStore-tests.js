import PracticePlannerStore from '../app/practice-planner/PracticePlannerStore';
import boatTypes from '../app/practice-planner/boatTypes';
import Immutable from 'immutable';

const initialData = {
		unassignedAttendees: Immutable.fromJS({
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
		}),
		boats: Immutable.fromJS({
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
		})
	};
	
describe('PracticePlannerStore.assign', () => {
	let data = {};
	
	const store = new PracticePlannerStore(initialData, (key, value) => {
		data[key] = value;
	});	
	
	beforeEach(() => {
		data = {};
	});
		
	it('assigns attendee to empty spot', () => {
		const attendeeId = 'TeamMembers/103';
		const attendee = initialData.unassignedAttendees.get(attendeeId);
		const boatKey = 'boat-2';
		const position = 'stroke';
		store.assign(attendee, boatKey, position);
		expect(data.boats.get(boatKey).get('seats').get(position)).toEqual(attendee);
	});
	
	it('removes attendee from unassigned attendees', () => {
		const attendeeId = 'TeamMembers/103';
		const attendee = initialData.unassignedAttendees.get(attendeeId);
		const boatKey = 'boat-2';
		const position = 'stroke';
		store.assign(attendee, boatKey, position);
		expect(data.unassignedAttendees.has(attendeeId)).toBeFalsy();
	});
	
	it('puts previous attendee in unassigned attendees', () => {		
		const attendeeId = 'TeamMembers/103';
		const attendee = initialData.unassignedAttendees.get(attendeeId);
		const boatKey = 'boat-1';
		const position = 'stroke';
		store.assign(attendee, boatKey, position);
		const oldAttendeeId = initialData.getIn([boatKey, 'seats', position, 'id']);
		expect(data.unassignedAttendees.has(oldAttendeeId)).toBeTruthy();
	});
});