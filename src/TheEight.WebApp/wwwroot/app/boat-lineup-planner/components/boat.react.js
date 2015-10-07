import React from 'react';
import { default as BoatSeat } from './boatSeat.react';

export default class Boat extends React.Component {
	render() {
		return (
			<div>
				<div>
					<div>{this.props.title}</div>
					<div>{this.props.type}</div>
				</div>
				<div>
					{this.props.seats.toJS()
						.map(seat => <BoatSeat seat={seat} />)}
				</div>
			</div>
		);
	}
}