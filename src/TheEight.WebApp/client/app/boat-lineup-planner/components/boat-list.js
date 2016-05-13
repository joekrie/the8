import Radium from "radium";
import { Component } from "react";

import Boat from "./boat";

@Radium
class BoatList extends Component {
  render() {
    const { boats } = this.props;    
    
    const boatComponents = boats.map(boat => 
      <Boat key={boat.boatId} boat={boat} />);

    const styles = {
      "marginTop": "0",
      "marginBottom": "0",
      "display": "flex"
    };

    return (
      <div style={styles}>
        {boatComponents}
      </div>
    );
  }
}

export default BoatList