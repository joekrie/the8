import React from 'react';
import dndTypes from '../constants/dndTypes';
import { DragSource } from 'react-dnd';
import classNames from 'classnames';
import attendeePositions from '../constants/attendeePositions';

const spec = {
	beginDrag: (props, monitor, component) => {
        console.log('beginDrag');
        console.log(props);
        console.log(monitor);
        console.log(component);
        return {};
    },
	endDrag: (props, monitor, component) => ({}),
	//canDrag: (props, monitor) => true
};

const collect = (connect, monitor) => ({
	connectDragSource: connect.dragSource()
});

@DragSource(dndTypes.ATTENDEE, spec, collect)
export default class extends React.Component {
	render() {
		const { attendee, connectDragSource } = this.props;
		
		const classes = classNames('attendee', {
			'rower': attendee.get('position') == attendeePositions.ROWER,
			'coxswain': attendee.get('position') == attendeePositions.COXSWAIN
		});
		
		return connectDragSource(
			<div className={classes}>
				{attendee.get('displayName')}
			</div>
		);
	}
}