import React from 'react';
import { createStore, bindActionCreators } from 'redux';
import { Provider, connect } from 'react-redux';
import reducer from './actions/reducer';
import * as actionCreators from './actions/actionCreators';
import InviteList from './components/InviteList';
import Immutable from 'immutable';

class App extends React.Component {
	render() {
	    const { emails, addEmail, updateEmail, removeEmail } = this.props;

	    return <InviteList emails={emails}
                           addEmail={addEmail}
	                       updateEmail={updateEmail}
                           removeEmail={removeEmail} />;
	}
}

const ConnectedApp = connect(
    state => ({
        emails: state.emails
    }), 
    dispatch => bindActionCreators(actionCreators, dispatch)
)(App);

export default class extends React.Component {
    render() {
        const { initialEmails } = this.props;

        const store = createStore(reducer, {
            emails: Immutable.fromJS(initialEmails)
        });

        return (
            <Provider store={store}>
                <ConnectedApp />
            </Provider>
		);
    }
}