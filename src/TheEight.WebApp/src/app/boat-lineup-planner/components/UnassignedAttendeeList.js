import React from 'react';
import { DropTarget } from 'react-dnd';
import dndTypes from '../constants/dndTypes';
import Attendee from './Attendee';

const spec = {
	drop: (props, monitor) => {
		const { attendeeId } = monitor.getItem();
		const { onUnassignAttendee } = props;
		onUnassignAttendee(attendeeId);
	}
};

const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class extends React.Component {
	render() {
		const { unassignedAttendees, connectDropTarget } = this.props;
		
		return connectDropTarget(
			<div className='unassigned-attendee-list'>
				{unassignedAttendees.map(teamMember => 
					<Attendee teamMember={teamMember} key={teamMember.id} />
				)}
			</div>
		);
	}
}