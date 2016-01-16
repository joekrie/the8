import { Component } from "react";
import { DragSource } from "react-dnd";
import Attendee from "./Attendee";

const dndSpec = {
	beginDrag: props => ({
		attendeeId: props.attendee.get("attendeeId")
	})
};

const dndCollect = connect => ({
	connectDragSource: connect.dragSource()
});

@DragSource("ATTENDEE", dndSpec, dndCollect)
export default class extends Component {
    render() {
        const { attendee, connectDragSource } = this.props;

        return connectDragSource(
            <div>
				<Attendee attendee={attendee} />
			</div>
        );
    }
}