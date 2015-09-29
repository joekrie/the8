import { Component } from 'react';

const spec = {
	drop: (props, monitor, component) => {},
	hover: (props, monitor, component) => {},
	canDrop: (props, monitor) => {}
};

const collect = (monitor, connect) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class UnassignedAttendeeList extends Component {
	render() {
		return this.props.connectDropTarget(
			<div>
				{this.props.attendees.map(attendee => (<Attendee key={attendee.id} attendee={this.attendee} />))}}
			</div>
		);
	}
}