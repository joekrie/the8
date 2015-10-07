import React from 'react';

const spec = {
	drop: (props, monitor, component) => {},
	hover: (props, monitor, component) => {},
	canDrop: (props, monitor) => {}
};

const collect = (connect, monitor) => ({
	connectDropTarget: connect.dropTarget()
});

@DropTarget(dndTypes.ATTENDEE, spec, collect)
export default class UnassignedAttendeeList extends React.Component {
	render() {
		return this.props.connectDropTarget(
			<div>
				{this.props.attendees.map(attendee => (<Attendee key={attendee.id} attendee={this.attendee} />))}}
			</div>
		);
	}
}