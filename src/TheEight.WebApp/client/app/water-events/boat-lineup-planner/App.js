import { Component, PropTypes } from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducer } from "./actions";
import Immutable from "immutable";
import Container from "./Container";

export default class extends Component {
    render() {
        const { initialEmails } = this.props;

        const store = createStore(reducer, {
            emails: Immutable.List(initialEmails)
        });

        return (
            <Provider store={store}>
                <Container />
            </Provider>
		);
}
}