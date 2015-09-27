import { Component } from 'react';
import { DropTarget } from 'react-dnd';
import { actions, dragTypes } from '../constants';

const spec = {
	drop: (props, monitor, component) => {},
	hover: (props, monitor, component) => {},
	canDrop: (props, monitor) => {}
};

const collect = (monitor, connect) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class BoatSeat extends Component {
	render() {
		const className = this.props.isCox ? 'cox-seat' : 'rower-seat';
	
		return this.props.connectDropTarget(
			<div className={className}>
				{this.attendee ? <Attendee attendee={this.attendee} /> : null}
			</div>
		);
	}
}