import Boat from "./Boat";
import Radium from "radium";

const BoatList = ({ boats, placeAttendees }) => {
    const boatComponents = boats.map(boat => (
        <Boat key={boat.get("boatId")}
            boat={boat}
            boats={boats}
            placeAttendees={placeAttendees} />
        )
    );

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