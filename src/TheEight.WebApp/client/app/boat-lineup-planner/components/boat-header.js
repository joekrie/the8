import Radium from "radium";
import { Component } from "react";

@Radium
class BoatHeader extends Component {
  render() {
    const { boatInfo: { title } } = this.props;
    
    const styles = {
      "backgroundColor": "#263F52",
      "marginBottom": "10px",
      "padding": "10px"
    };

    return (
      <div style={styles}>
        {title}
      </div>
    );
  }
}

export default BoatHeader