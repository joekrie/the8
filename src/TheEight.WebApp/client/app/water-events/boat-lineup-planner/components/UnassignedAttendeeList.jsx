import Attendee from "./Attendee";

const UnassignedAttendeeList = props => {
    const { unassignedAttendees } = props;

    return (
        <div className="unassigned-attendee-list">
            <div className="header">
                Unassigned
            </div>
            <div className="attendees">
                {unassignedAttendees.map(tm => <Attendee key={tm.id} attendee={tm} />)}
            </div>
		</div>
    );
};

UnassignedAttendeeList.propTypes = {

};

export default UnassignedAttendeeList;