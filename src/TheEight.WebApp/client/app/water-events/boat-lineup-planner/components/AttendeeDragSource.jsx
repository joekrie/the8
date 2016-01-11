import React from "react";
import { DragSource } from "react-dnd";
import Attendee from "./Attendee";

const dndSpec = {
	beginDrag: props => ({
		attendeeId: props.attendee.get("id")
	})
};

const dndCollect = (connect, monitor) => ({
	connectDragSource: connect.dragSource()
});

@DragSource("ATTENDEE", dndSpec, dndCollect)
export default class extends React.Component {
	render() {
	    const { attendee, connectDragSource } = this.props;

		return connectDragSource(
			<div>
				<Attendee attendee={attendee} />
			</div>
		);
	}
}