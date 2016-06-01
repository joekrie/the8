import Radium from "radium";
import { Component } from "react";
import { DragSource } from "react-dnd";

import { defaultDragCollect } from "../../common/dnd-defaults";
import * as ItemTypes from "../item-types";

export const dragSpec = {
  beginDrag(props) {
    return {
      draggedAttendeeId: props.attendeeListItem.attendee.attendeeId
    }
  }
};

@Radium
@DragSource(ItemTypes.ATTENDEE_LIST_ITEM, dragSpec, defaultDragCollect)
export default class AttendeeListItem extends Component {
  render() {
    const { attendeeListItem, connectDragSource } = this.props;

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
    rootStyles.push(attendeeListItem.attendee.isCoxswain ? styles.coxswain : styles.rower);

    return connectDragSource(
      <div style={rootStyles}>
        {attendeeListItem.attendee.displayName}
      </div>
    );
  }
}