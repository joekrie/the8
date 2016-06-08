import { List } from "immutable";
import { Component } from "react";

import Boat from "./boat";

class BoatList extends Component {
  render() {
    const { boats } = this.props;   

    const boatComponents = boats.map(boat => 
      <Boat key={boat.details.boatId} boat={boat} />
    );

    const styles = {
      "marginTop": "0px",
      "marginBottom": "0px",
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