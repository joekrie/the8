import { Component } from 'react';
import { DropTarget } from 'react-dnd';
import { dragType } from '../constants';

export default class BoatList extends Component {
	render() {
		return (
			<div>
				{this.props.boats.map(boat => (<Boat boat={boat} dispatcher={this.props.dispatcher}>))}
			</div>
		);
	}
}