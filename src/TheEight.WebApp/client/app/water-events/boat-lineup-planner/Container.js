import { Component, PropTypes } from "react";
import { createStore, bindActionCreators } from "redux";
import { connect } from "react-redux";
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