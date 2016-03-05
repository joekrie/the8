import { Component, PropTypes } from "react";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducer } from "./actions";
import Immutable from "immutable";
import Container from "./Container";

export default class extends Component {
    render() {
        const { event } = this.props;

        const store = createStore(reducer, {
            event: Immutable.fromJS(event)
        });

        return (
            <Provider store={store}>
                <Container />
            </Provider>
		);
}
}