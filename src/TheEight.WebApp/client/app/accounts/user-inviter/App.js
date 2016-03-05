import { Component, PropTypes } from "react";
import { createStore, bindActionCreators } from "redux";
import { Provider, connect } from "react-redux";
import { actionCreators, reducer } from "./actions";
import Container from "./Container";
import Immutable from "immutable";

export default class extends Component {
    render() {
        const { attendees, boats } = this.props;

        const store = createStore(reducer, {
            attendees: Immutable.List(attendees),
            boats: Immutable.List(boats)
        });

        return (
            <Provider store={store}>
                <Container />
            </Provider>
		);
    }
}