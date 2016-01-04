import Boat from './Boat';

function createBoat(boat, boatKey, moveAttendee) {
    return (
        <Boat key={boatKey}
            boat={boat}
            boatKey={boatKey}
            assignAttendee={moveAttendee} />
    );
}

export default function(props) {
    const { boats, moveAttendee } = props;

    return (
        <div className='boat-list'>
			{boats.map((boat, boatKey) => createBoat(boat, boatKey, moveAttendee))}
		</div>
    );
};