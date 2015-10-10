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
	
		const classes = classNames(
			'attendee',
			attendee.get('position') === attendeePositions.COXSWAIN ? 'coxswain': 'rower'
		);	
	
		return connectDragSource(
			<div className={classes}>
				{attendee.get('displayName')}
			</div>
		);
	}
}