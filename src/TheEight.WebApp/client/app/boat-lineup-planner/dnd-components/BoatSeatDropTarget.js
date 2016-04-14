import { Component } from "react";
import { DropTarget } from "react-dnd";
import BoatSeat from "../presentational-components/BoatSeat";
import { defaultDropCollector } from "../../common/dndDefaults";

const canDrop = (_, monitor) => {
    const dragItem = monitor.getItem();
        
    if (!dragItem) {
        return false;
    }
    

};

export const generateDropActions = () => {
    
};

const drop = ({ placeAttendees, attendee }, monitor) => {
    const dragItem = monitor.getItem();
        
    if (!dragItem) {
        return;
    }


};

export const dropSpec = { canDrop, drop };

@DropTarget("ATTENDEE", dropSpec, defaultDropCollector)
export default class extends Component {
	render() {
	    const { connectDropTarget, attendee, placement } = this.props;

		return connectDropTarget(
			<div>
                <BoatSeat attendee={attendee} placement={placement} />
			</div>
		);
	}
}