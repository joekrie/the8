import React from 'react';
import { DragDropContext } from 'react-dnd';
import Immutable from 'immutable';
import UnassignedAttendeeList from './components/UnassignedAttendeeList';
import BoatList from './components/BoatList';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';
import { connect } from 'react-redux';
import bindAttendeeActionCreators from './actions/bindAttendeeActionCreators';
import stateConnector from './stateConnector';

@DragDropContext(HTML5Backend)
class App extends React.Component {
	render() {
		const { dispatch, unassignedAttendees, boats, onAssignAttendee, 
			onUnassignAttendee, onMoveAttendee } = this.props;

		return (
			<div className='boat-lineup-planner'>
				<UnassignedAttendeeList 
					unassignedAttendees={unassignedAttendees} 
					onUnassignAttendee={onUnassignAttendee} />
				<BoatList 
					onAssignAttendee={onAssignAttendee} 
					onMoveAttendee={onMoveAttendee}
					boats={boats} />
			</div>
		);
	}
}

export default connect(stateConnector, bindAttendeeActionCreators)(App);