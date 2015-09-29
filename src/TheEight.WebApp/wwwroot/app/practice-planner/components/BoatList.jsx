import { Component } from 'react';
import { DropTarget } from 'react-dnd';
import { dragType } from '../constants';

export default class BoatList extends Component {
	render() {
		return (
			<div>
				{this.props.boats.toArray()
					.map(boat => <Boat key={boat.key} boat={boat} dispatcher={this.props.dispatcher}>)}
			</div>
		);
	}
}