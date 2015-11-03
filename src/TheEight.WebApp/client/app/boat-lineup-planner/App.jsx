import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Immutable from 'immutable';

import UnassignedAttendeeList from './components/UnassignedAttendeeList';
import BoatList from './components/BoatList';
import bindAttendeeActionCreators from './actions/bindAttendeeActionCreators';
import attendeeReducers from './actions/attendeeReducers';
import stateConnector from './stateConnector';

@DragDropContext(HTML5Backend)
class App extends React.Component {
	render() {
	    const { dispatch, unassignedAttendees, boats, onAssignAttendee, onUnassignAttendee, 
            onMoveAttendee } = this.props;

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

const AppProvider = connect(stateConnector, bindAttendeeActionCreators)(App);

export default class extends React.Component {
    render() {
        return (
            <Provider store={createStore(attendeeReducers)}>
                <AppProvider/>
            </Provider>
		);
    }
}