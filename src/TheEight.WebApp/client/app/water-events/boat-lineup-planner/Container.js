import { Component, PropTypes } from "react";
import { createStore, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import ImmutablePropTypes from "react-immutable-proptypes";
import AssignableAttendeeListDropTarget from "./components/AssignableAttendeeListDropTarget";
import BoatList from "./components/BoatList";
import mapStateToProps from "./mapStateToProps";
import { actionCreators } from "./actions";
import Radium from "radium";

@DragDropContext(HTML5Backend)
class Container extends Component {
	render() {
	    const { assignableAttendees, assignAttendee, unassignAttendee, boats } = this.props;

		return (
			<div style={styles.root}>
				<AssignableAttendeeListDropTarget assignableAttendees={assignableAttendees} 
                                                  unassignAttendee={unassignAttendee} />
				<BoatList boats={boats}
                          assignAttendee={assignAttendee}/>
			</div>
		);
	}
}

Container.propTypes = {
    //unassignedAttendees: ImmutablePropTypes.listOf().isRequired
};

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

export default Radium(ConnectedApp);