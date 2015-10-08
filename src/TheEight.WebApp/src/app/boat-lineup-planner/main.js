import React from 'react';
import ReactDOM from 'react-dom';
import BoatLineupPlanner from './components/BoatLineupPlanner';
import { createStore } from 'redux';
import attendeeReducers from './reducers/attendeeReducers';
import actionTypes from './actions/actionTypes';
import attendeeActions from './actions/attendeeActions';

window.store = createStore(attendeeReducers);
window.actionTypes = actionTypes;
window.attendeeActions = attendeeActions;

ReactDOM.render(<BoatLineupPlanner state={window.store.getState()} />, document.getElementById('app'));