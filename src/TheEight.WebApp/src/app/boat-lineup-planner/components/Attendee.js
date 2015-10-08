import React from 'react';
import dndTypes from '../constants/dndTypes';
import { DragSource } from 'react-dnd';
import classNames from 'classnames';
import attendeePositions from '../constants/attendeePositions';

const spec = {
	beginDrag: props => ({
		attendeeId: props.teamMember.get('id')
	})
};

const collect = (connect, monitor) => ({
	connectDragSource: connect.dragSource()
});

@DragSource(dndTypes.ATTENDEE, spec, collect)
export default class extends React.Component {
	render() {
		const { teamMember, connectDragSource } = this.props;
		
		const classes = classNames('attendee', {
			'rower': teamMember.get('position') == attendeePositions.ROWER,
			'coxswain': teamMember.get('position') == attendeePositions.COXSWAIN
		});
		
		return connectDragSource(
			<div className={classes}>
				{teamMember.get('displayName')}
			</div>
		);
	}
}