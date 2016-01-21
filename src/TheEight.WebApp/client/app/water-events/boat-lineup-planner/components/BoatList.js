import Boat from "./Boat";
import Radium from "radium";

const BoatList = props => {
    const { boats, assignAttendee, moveAttendee } = props;

    return (
        <div style={styles.root}>
			{boats.map(boat => 
			    <Boat key={boat.get("boatId")}
                      boat={boat}
                      assignAttendee={assignAttendee} 
                      moveAttendee={moveAttendee} />)}
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