import React from 'react';
import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Immutable from 'immutable';

import UnassignedAttendeeList from './components/UnassignedAttendeeList';
import BoatList from './components/BoatList';
import stateConnector from './stateConnector';
import Reducer from '../Reducer';
import initialState from './fakeInitialState';
import assignAttendee from './actions/assignAttendee';
import unassignAttendee from './actions/unassignAttendee';

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

const reducer = new Reducer(initialState);
reducer.register(assignAttendee);
reducer.register(unassignAttendee);

const AppProvider = connect(stateConnector, reducer.bind)(App);

export default class extends React.Component {
    render() {
        return (
            <Provider store={createStore(reducer.reduce)}>
                <AppProvider/>
            </Provider>
		);
    }
}