import React from 'react';
import { DropTarget } from 'react-dnd';
import dndTypes from '../constants/dndTypes';
import Attendee from './Attendee';

const spec = {
	drop: (props, monitor, component) => ({}),
	hover: (props, monitor, component) => ({}),
	//canDrop: (props, monitor) => {}
};

const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class extends React.Component {
	render() {
		const { attendees, connectDropTarget } = this.props;
		
		return connectDropTarget(
			<div className='unassigned-attendee-list'>
				{attendees.map((attendee, key) => 
					<Attendee attendee={attendee} key={key} />
				)}
			</div>
		);
	}
}