import React from 'react';
import { DropTarget } from 'react-dnd';
import { default as Attendee } from './attendee.react';

const spec = {
	drop: (props, monitor, component) => {},
	hover: (props, monitor, component) => {},
	canDrop: (props, monitor) => {}
};

const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class BoatSeat extends React.Component {
	render() {
		const className = this.props.isCox ? 'cox-seat' : 'rower-seat';
	
		return this.props.connectDropTarget(
			<div className={className}>
				{this.attendee ? <Attendee attendee={this.attendee} /> : null}
			</div>
		);
	}
}