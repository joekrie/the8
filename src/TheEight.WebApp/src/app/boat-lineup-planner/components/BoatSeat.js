import React from 'react';
import { DropTarget } from 'react-dnd';
import Attendee from './Attendee';
import dndTypes from '../constants/dndTypes';

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
		const { seat, connectDropTarget } = this.props;
		let content = null;
		
		if (seat !== null) {
			content = <Attendee attendee={seat} />;
		}
	
		return connectDropTarget(
			<div className='boat-seat'>
				{content}
			</div>
		);
	}
}