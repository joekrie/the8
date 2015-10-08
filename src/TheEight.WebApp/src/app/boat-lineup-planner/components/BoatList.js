import React from 'react';
import Boat from './Boat';

export default class extends React.Component {
	render() {
		const { boats } = this.props;
		
		return (
			<div className='boat-list'>
				{boats.map((boat, key) => 
					<Boat key={key} boat={boat} />
				)}
			</div>
		);
	}
}