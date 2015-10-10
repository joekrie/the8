import React from 'react';
import Boat from './Boat';

export default class extends React.Component {
	render() {
		const { boats, boatKey, onAssignAttendee, onMoveAttendee } = this.props;
		
		return (
			<div className='boat-list'>
				{boats.map((boat, boatKey) => 
					<Boat key={boatKey} 
						boat={boat} 
						boatKey={boatKey}						
						onAssignAttendee={onAssignAttendee} 
						onMoveAttendee={onMoveAttendee} />
				)}
			</div>
		);
	}
}