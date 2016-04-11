import { Component, PropTypes } from "react";
import { Provider, connect } from "react-redux";
import { reducer } from "./actions";
import Immutable from "immutable";
import { createStore, bindActionCreators } from "redux";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import AssignableAttendeeListDropTarget from "./components/AssignableAttendeeListDropTarget";
import BoatList from "./components/BoatList";
import mapStateToProps from "./mapStateToProps";
import { actionCreators } from "./actions";
import Radium from "radium";

@DragDropContext(HTML5Backend)
@Radium
class Container extends Component {
    render() {
        const { assignableAttendees, boats, placeAttendee, unplaceAttendee } = this.props;

        return (
            <div style={styles.root}>
				<AssignableAttendeeListDropTarget
                assignableAttendees={assignableAttendees}
                unplaceAttendee={unplaceAttendee} />
				<BoatList boats={boats}
                placeAttendee={placeAttendee} />
			</div>
        );
    }
}

const styles = {
    root: {
        "position": "absolute",
        "height": "100%"
    }
};

const ConnectedApp = connect(
    mapStateToProps,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(Container);

export default ConnectedApp;

export default class extends Component {
    render() {
        const { event } = this.props;

        const store = createStore(reducer, {
            event: Immutable.fromJS(event)
        });

        return (
            <Provider store={store}>
              	<AssignableAttendeeListDropTarget
                    assignableAttendees={assignableAttendees}
                    unplaceAttendee={unplaceAttendee} />
                <BoatList boats={boats}
                    placeAttendee={placeAttendee} />
            </Provider>
        );
    }
}