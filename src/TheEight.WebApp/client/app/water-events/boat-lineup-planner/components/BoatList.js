import Boat from "./Boat";
import Radium from "radium";

const createBoat = (boat, assignAttendee) => {
    return (
        <Boat key={boat.get("boatId")}
              boat={boat}
              assignAttendee={assignAttendee} />
    );
};

const BoatList = props => {
    const { boats, assignAttendee } = props;

    return (
        <div style={[styles.root]}>
			{boats.map(boat => createBoat(boat, assignAttendee))}
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