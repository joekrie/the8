import React from 'react';
import { DropTarget } from 'react-dnd';
import Attendee from './Attendee';
import dndTypes from '../constants/dndTypes';
import { seatIsEmpty } from '../utils/boatSeatUtils';

const spec = {
	drop: (props, monitor) => {
		const { attendeeId } = monitor.getItem();
		const { onAssignAttendee, boatKey, seatPosition } = props;		
		onAssignAttendee(attendeeId, boatKey, seatPosition);
	},
	canDrop: props => seatIsEmpty(props.seat)
};

const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class extends React.Component {
	render() {
		const { seat, seatPosition, connectDropTarget } = this.props;
		const attendee = seatIsEmpty(seat) 
			? null 
			: <Attendee key={seat.getIn(['attendee', 'id'])} 
				attendee={seat.get('attendee')} />;

		return connectDropTarget(
			<div className='boat-seat'>
				<div className='boat-seat-label'>
                    {seatPosition}
                 </div>
				{attendee}
			</div>
		);
	}
}