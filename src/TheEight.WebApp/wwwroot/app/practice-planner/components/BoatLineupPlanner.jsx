import { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import Dispatcher from '../../common/dispatcher';
import { actions } from '../constants';
import _ from 'lodash';

@DragDropContext(HTML5Backend)
export default class BoatLineupPlanner extends Component {
	constructor() {
		this.dispatcher = new Dispatcher();
		
		this.dispatcher.registerAction(actions.ASSIGN, 
			(attendee, newSeatKey) => {
				// assign attendee to new seat
			});
		
		this.dispatcher.registerAction(actions.UNASSIGN, 
			(attendee, oldSeatKey) => {
				// set old seat to empty
				// add attendee to unassigned list
			});
			
		this.dispatcher.registerAction(actions.MOVE,
			(attendee, oldSeatKey, newSeatKey) => {
				// set old seat to empty
				// assign attendee to new seat
			});
	}
	
	getInitialState() {
		return {
			unassignedAttendees: [],
			boats: []
		};
	}
	
	componentDidMount() {
		this.setState({
			unassignedAttendees: [
				{
					teamMemberId: 'TeamMembers/103',
					sortName: 'Yealsalot, George',
					displayName: 'George Yealsalot',
					position: 'coxswain'
				},
				{
					teamMemberId: 'TeamMembers/77',
					sortName: 'Earges, Jimmy',
					displayName: 'Jimmy Earges',
					position: 'rower'
				},
				{
					teamMemberId: 'TeamMembers/31',
					sortName: 'Crabbs, Bill',
					displayName: 'Bill Crabbs',
					position: 'rower'
				}
			],
			boats: [
				{
					key: 'boat-1',
					title: 'M2',
					type: {
						rowers: 4,
						coxswain: true,
						shortTitle: '4+',
						longTitle: 'four'
					},
					coxswain: {
						teamMemberId: 'TeamMembers/17',
						sortName: 'Passem, Henry',
						displayName: 'Henry Passem',
						position: 'rower'
					},
					seats: [
						{
							position: 1,
							attendee: {
								teamMemberId: 'TeamMembers/54',
								sortName: 'Rowerson, Mickey',
								displayName: 'Mickey Rowerson',
								position: 'rower'
							}
						},
						{
							position: 2,
							attendee: null
						},
						{
							position: 3,
							attendee: null
						},
						{
							position: 4,
							attendee: null
						}
					]
				},
				{
					key: 'boat-2',
					title: 'Jaws',
					type: {
						rowers: 2,
						coxswain: false,
						shortTitle: '2x',
						longTitle: 'double'
					},
					seats: [
						{
							position: 1,
							attendee: null
						},
						{
							position: 2,
							attendee: null
						}
					]
				}
			]
		});
	}

	render() {
		return (
			<div>
				<UnassignedAttendeeList dispatcher={this.dispatcher} />
				<BoatList boats={this.state.boats} dispatcher={this.dispatcher} />
			</div>
		);
	}
}
	
function createRowerSeatLabel(count, num) {
	if (num === 1) {
		return 'Bow';
	}
	
	if (num === count) {
		return 'Stroke';
	}
	
	return String(num);
}

function createEmptyRowerSeat(boatKey, boatType, position) {
	const seatKey = `${boatKey}.seat-${position}`;

	return {
		key: seatKey,
		attendee: null,
		label: createRowerSeatLabel(boatType.seatCount, num)
	};
}

function createEmptyBoat(type) {
	const boatKey = _.uniqueKey('boat-');
			
	const seats = _.times(type.seatCount, 
		num => createEmptyRowerSeat(boatKey, type, num));
	
	return {
		key: boatKey,
		seats: seats
	}
}