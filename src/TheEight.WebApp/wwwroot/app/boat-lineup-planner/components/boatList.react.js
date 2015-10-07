import React from 'react';
import { DropTarget } from 'react-dnd';
import { default as Boat } from './boat.react';

export default class BoatList extends React.Component {
	render() {
		return (
			<div>
				{this.props.boats.toArray()
					.map(boat => <Boat key={boat.key} boat={boat} />)}
			</div>
		);
	}
}