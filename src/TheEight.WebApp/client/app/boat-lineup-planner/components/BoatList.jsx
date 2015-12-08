import Boat from './Boat';

function createBoat(boat, boatKey, props) {
    return (
        <Boat key={boatKey}
            boat={boat}
            boatKey={boatKey}
            assignAttendee={props.moveAttendee} />
    );
}

export default function(props) {
    const { boats } = props;

    return (
        <div className='boat-list'>
			{boats.map(createBoat)}
		</div>
    );
};