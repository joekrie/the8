import { Component } from "react";
import { DragSource } from "react-dnd";
import Attendee from "./Attendee";

const dndSpec = {
    beginDrag: props => {
        const { attendee, placement } = props;

	    return {
	        movedAttendeeId: attendee.get("attendeeId"),
            originPlacement: placement
	    };
	}
};

const dndCollect = connect => ({
	connectDragSource: connect.dragSource()
});

@DragSource("ATTENDEE", dndSpec, dndCollect)
class AttendeeDragSource extends Component {
    render() {
        const { attendee, connectDragSource } = this.props;

        return connectDragSource(
            <div>
				<Attendee attendee={attendee} />
			</div>
        );
    }
}

export default AttendeeDragSource;