import Radium from "radium";
import { Component } from "react";
import { DragSource } from "react-dnd";

import { defaultDragCollector } from "../../common/dnd-defaults";

export const dragSpec = {
    beginDrag: ({ seat }) => ({ seat })
};

@DragSource("ATTENDEE", dragSpec, defaultDragCollector)
@Radium
class Attendee extends Component {
    render() {
        const { attendee, connectDragSource } = this.props;

        const styles = {
            base: {
                "marginBottom": "10px",
                "padding": "10px",
                "color": "#F5F5F5",
                "cursor": "grab"
            },
            rower: {
                "backgroundColor": "#304F66"
            },
            coxswain: {
                "backgroundColor": "#2A4458"
            }
        };
    
        const rootStyles = [styles.base];
        rootStyles.push(attendee.isCoxswain ? styles.coxswain : styles.rower);

        return connectDragSource(
            <div style={rootStyles}>
		        {attendee.displayName}
	        </div>
        );
    }
}

export default Attendee