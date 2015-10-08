import React from 'react';
import BoatSeat from './BoatSeat';

export default class extends React.Component {
	render() {
		const { boat, boatKey, onAssignAttendee } = this.props;
		
		return (
			<div className='boat'>
				<div>
					<div>
						{boat.get('title')}
					</div>
					<div>
						{boat.get('seats').map((teamMember, seatPosition) => 
							<BoatSeat key={seatPosition}
								seatPosition={seatPosition}
								teamMember={teamMember} 
								boatKey={boatKey}						
								onAssignAttendee={onAssignAttendee} />						
						)}
					</div>
				</div>
			</div>
		);
	}
}