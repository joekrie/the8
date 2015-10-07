import React from 'react';
import dndTypes from '../dndTypes';

const spec = {
	beginDrag: (props, monitor, component) => {},
	endDrag: (props, monitor, component) => {},
	canDrag: (props, monitor) => true
};

const collect = (connect, monitor) => ({
	connectDragSource: connect.dragSource()
});

@DragSource(dndTypes.ATTENDEE, spec, collect)
export default class RootComponent extends React.Component {
	render() {
		return this.props.connectDragSource(
			<div>
				{this.props.displayName}
			</div>
		);
	}
}