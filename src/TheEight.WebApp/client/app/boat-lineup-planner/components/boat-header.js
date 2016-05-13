import Radium from "radium";
import { Component } from "react";

@Radium
class BoatHeader extends Component {
  render() {      
    const styles = {
      "backgroundColor": "#263F52",
      "marginBottom": "10px",
      "padding": "10px"
    };

    const { boatInfo: { title } } = this.props;

    return (
      <div style={styles}>
        {title}
      </div>
    );
  }
}

export default BoatHeader