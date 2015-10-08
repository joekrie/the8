import React from 'react';
import { DropTarget } from 'react-dnd';
import Attendee from './Attendee';
import dndTypes from '../constants/dndTypes';

const spec = {
	drop: (props, monitor) => {
		const { attendeeId } = monitor.getItem();
		const { onAssignAttendee, boatKey, seatPosition } = props;		
		onAssignAttendee(attendeeId, boatKey, seatPosition);
	},
	canDrop: props => !props.teamMember
};

const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class extends React.Component {
	render() {
		const { teamMember, connectDropTarget } = this.props;
		let content = teamMember && <Attendee teamMember={teamMember} />;

		return connectDropTarget(
			<div className='boat-seat'>
				{content}
			</div>
		);
	}
}