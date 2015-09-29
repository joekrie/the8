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
		this.store = new PracticePlannerStore(this.state, this.setState);
		
		this.dispatcher = new Dispatcher();
		this.dispatcher.registerAction(actions.ASSIGN, store.assign);		
		this.dispatcher.registerAction(actions.UNASSIGN, store.unassign);			
		this.dispatcher.registerAction(actions.MOVE, store.move);
	}
	
	getInitialState() {
		return {
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