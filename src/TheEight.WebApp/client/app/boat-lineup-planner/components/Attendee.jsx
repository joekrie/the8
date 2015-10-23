import React from 'react';
import dndTypes from '../constants/dndTypes';
import { DragSource } from 'react-dnd';
import classNames from 'classnames';
import attendeePositions from '../constants/attendeePositions';

const spec = {
	beginDrag: props => ({
		attendeeId: props.attendee.get('id')
	})
};

const collect = (connect, monitor) => ({
	connectDragSource: connect.dragSource()
});

@DragSource(dndTypes.ATTENDEE, spec, collect)
export default class extends React.Component {
	render() {
	    const { attendee, connectDragSource } = this.props;
	    const isCoxswain = attendee.get('position') === attendeePositions.COXSWAIN;

		const classes = classNames(
			'attendee',
			isCoxswain ? 'coxswain': 'rower'
		);

		let displayName = attendee.get('displayName');
	
		return connectDragSource(
			<div className={classes}>
				{displayName}
			</div>
		);
	}
}