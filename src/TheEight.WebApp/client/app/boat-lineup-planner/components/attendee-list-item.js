import Radium from "radium";
import { Component } from "react";
import { DragSource } from "react-dnd";

import { defaultDragCollect } from "../../common/dnd-defaults";
import * as ItemTypes from "../item-types";

export const dragSpec = {
  beginDrag: ({ seat }) => ({ 
    originSeat: seat 
  })
};

@Radium
@DragSource(ItemTypes.ATTENDEE_LIST_ITEM, dragSpec, defaultDragCollect)
export default class AttendeeListItem extends Component {
    render() {
        const { attendeelistItem: { attendee }, connectDragSource } = this.props;

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