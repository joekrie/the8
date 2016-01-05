import React from 'react';
import { render } from 'react-dom';
import { createStore, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import reducer from './actions/reducer';
import * as actionCreators from './actions/actionCreators';
import InviteList from './components/InviteList';

class App extends React.Component {
	render() {
	    const { dispatch } = this.props;
	    const boundActionCreators = bindActionCreators(actionCreators, dispatch);

	    return <InviteList {...boundActionCreators} />;
	}
}

const store = createStore(reducer);
const stateConnector = state => state;
const AppProvider = connect(stateConnector)(App);

export default class extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <AppProvider />
            </Provider>
		);
    }
}