import React from 'react';
import { createStore } from 'redux';
import { Provider, connect, bindActionCreators } from 'react-redux';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import UnassignedAttendeeList from './components/UnassignedAttendeeList';
import BoatList from './components/BoatList';
import stateConnector from './stateConnector';
import { actionCreators, reducer } from './actions';

@DragDropContext(HTML5Backend)
class App extends React.Component {
	render() {
	    const { dispatch, unassignedAttendees, boats } = this.props;
	    const boundActionCreators = bindActionCreators(actionCreators, dispatch);

		return (
			<div className='boat-lineup-planner'>
				<UnassignedAttendeeList unassignedAttendees={unassignedAttendees} {...boundActionCreators} />
				<BoatList boats={boats} {...boundActionCreators} />
			</div>
		);
	}
}

const ConnectedApp = connect(stateConnector)(App);

export default class extends React.Component {
    render() {
        return (
            <Provider store={createStore(reducer)}>
                <ConnectedApp/>
            </Provider>
		);
    }
}