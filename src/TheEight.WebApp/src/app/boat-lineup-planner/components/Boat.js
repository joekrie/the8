import React from 'react';
import BoatSeat from './BoatSeat';

export default class extends React.Component {
	render() {
		const { boat } = this.props;
		
		return (
			<div className='boat'>
				<div>
					<div>
						{boat.get('title')}
					</div>
					<div>
						{boat.get('seats').map((seat, key) => 
							<BoatSeat seat={seat} key={key} />
						)}
					</div>
				</div>
			</div>
		);
	}
}