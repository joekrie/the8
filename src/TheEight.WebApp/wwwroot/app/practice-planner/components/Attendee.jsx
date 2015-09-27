import { Component } from 'react';
import { actions, dragTypes } from '../constants';

const spec = {
	beginDrag: (props, monitor, component) => {},
	endDrag: (props, monitor, component) => {},
	canDrag: (props, monitor) => {}
};

const collect = (monitor, connect) => ({
	connectDragSource: connect.dragSource()
});

@DragSource(dndTypes.ATTENDEE, spec, collect)
export default class RootComponent extends Component {
	render() {
		return this.props.connectDragSource(
			<div>
				{this.props.displayName}
			</div>
		);
	}
}