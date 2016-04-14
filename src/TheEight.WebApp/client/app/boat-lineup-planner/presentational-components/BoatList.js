import Boat from "./Boat";
import Radium from "radium";

const BoatList = ({ boats, placeAttendees }) => {
    const boatComponents = boats.map(b => {
        const boat = b.get("boat");
        const attendees = b.get("attendees");
        const boatProps = { boat, attendees, placeAttendees };

        return (
            <Boat key={boat.boatId} {...boatProps} />
        );
    });

    return (
        <div style={styles.root}>
			{boatComponents}
		</div>
    );
};

const styles = {
    root: {
        "marginTop": "0",
        "marginBottom": "0",
        "display": "flex"
    }
};

export default Radium(BoatList);