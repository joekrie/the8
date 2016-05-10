import Radium from "radium";
import { Component } from "react";

import BoatComponent from "./boat.component";

const styles = {
    root: {
        "marginTop": "0",
        "marginBottom": "0",
        "display": "flex"
    }
};

@Radium
class BoatListComponent extends Component {
    render() {
        const { boats, placeAttendees } = this.props;    
        
        const boatComponents = boats.map(b => {
            const boat = b.get("boat");
            const attendees = b.get("attendees");

            return (
                <BoatComponent key={boat.boatId} boat={boat} attendees={attendees} 
                    placeAttendees={placeAttendees} />
            );
        });

        return (
            <div style={styles.root}>
			    {boatComponents}
		    </div>
        );
    }
}

export default BoatListComponent