import { Component } from "react";
import { DragSource } from "react-dnd";
import Attendee from "./Attendee";
import { defaultDragCollector } from "../../common/dndDefaults";

const beginDrag = ({ attendee, currentPlacement }) => ({
    attendeeId: attendee.get("attendeeId"),
    currentPlacement
});

export const dragSpec = { beginDrag };

@DragSource("ATTENDEE", dragSpec, defaultDragCollector)
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