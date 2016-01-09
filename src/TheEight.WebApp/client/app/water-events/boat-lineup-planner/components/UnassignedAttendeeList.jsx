import Attendee from './Attendee';

function createUnassignedAttendee(teamMember) {
    return <Attendee key={teamMember.id} attendee={teamMember} />;
}

export default function(props) {
	const { unassignedAttendees } = props;
		
	return (
		<div className='unassigned-attendee-list'>
            <div className='header'>
                Unassigned
            </div>
            <div className='attendees'>
                {unassignedAttendees.map(createUnassignedAttendee)}
            </div>
		</div>
	);
}