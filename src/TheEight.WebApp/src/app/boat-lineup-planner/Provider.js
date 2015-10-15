import React from 'react';
import App from './App';
import { createStore } from 'redux';
import attendeeReducers from './actions/attendeeReducers';
import { Provider } from 'react-redux';

export default class extends React.Component {
    constructor() {
        super();
    }
	render() {
	    return (
            <Provider store={createStore(attendeeReducers)}>
                {() => <App />}
            </Provider>
		);
	}
}