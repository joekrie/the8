import BoatSeat from './BoatSeat';

export default function(props) {
	const { boat, boatKey, onAssignAttendee } = props;
		
	return (
		<div className='boat'>
			<div>
				<div className='header'>
					{boat.get('title')}
				</div>
				<div>
					{boat.get('seats').map((seat, seatPosition) => 
						<BoatSeat key={seatPosition}
							seat={seat}
							seatPosition={seatPosition}
							boatKey={boatKey}						
							onAssignAttendee={onAssignAttendee} />)}
				</div>
			</div>
		</div>
	);
};