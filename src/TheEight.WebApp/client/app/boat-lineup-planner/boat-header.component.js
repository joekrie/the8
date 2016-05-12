import Radium from "radium";
import { Component } from "react";

const styles = {
    "backgroundColor": "#263F52",
    "marginBottom": "10px",
    "padding": "10px"
};

@Radium
class BoatHeader extends Component {
    render() {
        const { boatInfo } = this.props;
    
        return (
            <div style={styles}>
                {boatInfo.title}
            </div>
        );
    }
}

export default BoatHeader