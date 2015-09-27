import { Component } from 'react';

export default class Boat extends Component {
	render() {
		return (
			<div>
				<div>
					<div>{this.props.title}</div>
					<div>{this.props.type}</div>
				</div>
				<div>
					{this.props.seats.map(seat => (<BoatSeat seat={seat} dispatcher={this.props.dispatcher} />))}
				</div>
			</div>
		);
	}
}