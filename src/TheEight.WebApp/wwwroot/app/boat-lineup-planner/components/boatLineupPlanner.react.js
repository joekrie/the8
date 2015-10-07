import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import Immutable from 'immutable';
import boatTypes from '../boatTypes';
import UnassignedAttendeeList from './unassignedAttendeeList.react';
import BoatList from './boatList.react';

@DragDropContext(HTML5Backend)
export default class BoatLineupPlanner extends React.Component {
	getInitialState() {
		return {

	}
	
	render() {
		return (
			<div>
				<UnassignedAttendeeList unassignedAttendees={this.state.unassignedAttendees} />
				<BoatList boats={this.state.boats} />
			</div>
		);
	}
}