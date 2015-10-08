import React from 'react';
import { DragDropContext } from 'react-dnd';
import Immutable from 'immutable';
import boatTypes from '../constants/boatTypes';
import UnassignedAttendeeList from './UnassignedAttendeeList';
import BoatList from './BoatList';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import { default as TouchBackend } from 'react-dnd-touch-backend';

@DragDropContext(HTML5Backend)
export default class extends React.Component {
	render() {
		const { state } = this.props;

		return (
			<div className='boat-lineup-planner'>
				<UnassignedAttendeeList attendees={state.get('unassignedAttendees')} />
				<BoatList boats={state.get('boats')} />
			</div>
		);
	}
}