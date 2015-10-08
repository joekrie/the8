import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore } from 'redux';
import attendeeReducers from './actions/attendeeReducers';
import { Provider } from 'react-redux';

ReactDOM.render(
	<Provider store={createStore(attendeeReducers)}>
		<App />
	</Provider>, 
	document.getElementById('app')
);