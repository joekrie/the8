import { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import Dispatcher from '../../common/dispatcher';
import { actions } from '../constants';
import _ from 'lodash';
import Immutable from 'immutable';
import boatTypes from '../boatTypes';

@DragDropContext(HTML5Backend)
export default class BoatLineupPlanner extends Component {
	constructor() {
		this.dispatcher = new Dispatcher();
		
		// todo: move these into testable modules
		
		this.dispatcher.registerAction(actions.ASSIGN, 
			(attendee, boatKey, position) => {
				const newBoats = this.state.boats
					.setIn([boatKey, 'seats', position], attendee);
					
				const newUnassigned = this.state.unassignedAttendees
					.delete(attendee.get('id'));
				
				this.setState('boats', newBoats);
				this.setState('unassignedAttendees', newUnassigned);
			});
		
		this.dispatcher.registerAction(actions.UNASSIGN, 
			(attendee, oldBoatKey, oldPosition) => {
				const newBoats = this.state.boats
					.setIn([oldBoatKey, 'seats', oldPosition], null);
					
				const newUnassigned = this.state.unassignedAttendees
					.set(attendee.get('id'), attendee);
					
				this.setState('boats', newBoats);
				this.setState('unassignedAttendees', newUnassigned);
			});
			
		this.dispatcher.registerAction(actions.MOVE,
			(newAttendee, oldBoatKey, oldPosition, newBoatKey, newPosition) => {
				const oldAttendee = this.state.boats.getIn([newBoatKey, 'seats', newPosition]);
				
				const newBoats = this.state.boats
					.setIn([oldBoatKey, 'seats', oldPosition], oldAttendee)
					.setIn([newBoatKey, 'seats', newPosition], newAttendee);
					
				this.setState('boats', newBoats);
			});
	}
	
	getInitialState() {
		return Immutable.fromJS({
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
					title: 'Jaws',
					type: boatTypes.DOUBLE,
					seats: {
						stroke: null,
						bow: null
					}
				}
			}
		});
	}
	
	render() {
		return (
			<div>
				<UnassignedAttendeeList unassignedAttendees={this.state.unassignedAttendees} 
					dispatcher={this.dispatcher} />
				<BoatList boats={this.state.boats} dispatcher={this.dispatcher} />
			</div>
		);
	}
}