import Boat from "./Boat";
import Radium from "radium";

const BoatList = props => {
    const { boats, placeAttendee } = props;

    return (
        <div style={styles.root}>
			{boats.map(boat => 
			    <Boat key={boat.get("boatId")}
                      boat={boat}
                      boats={boats}
                      placeAttendee={placeAttendee} />)}
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