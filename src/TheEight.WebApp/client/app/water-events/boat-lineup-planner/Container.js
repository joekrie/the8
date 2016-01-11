import { Component, PropTypes } from "react";
import { createStore, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import ImmutablePropTypes from "react-immutable-proptypes";
import UnassignedAttendeeList from "./components/UnassignedAttendeeList";
import BoatList from "./components/BoatList";
import mapStateToProps from "./mapStateToProps";
import { actionCreators } from "./actions";

@DragDropContext(HTML5Backend)
class Container extends Component {
	render() {
	    const { unassignedAttendees, boats } = this.props;

		return (
			<div className="boat-lineup-planner">
				<UnassignedAttendeeList unassignedAttendees={unassignedAttendees} />
				<BoatList boats={boats} />
			</div>
		);
	}
}

Container.propTypes = {
    //unassignedAttendees: ImmutablePropTypes.listOf().isRequired
};

export default connect(
    mapStateToProps,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(Container);