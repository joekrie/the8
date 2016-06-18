import { Component } from "react";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { defaultDragCollect } from "../../common/dnd-defaults";
import { ATTENDEE_LIST_ITEM } from "../item-types";
import { RACE_MODE } from "../models/event-modes";
import Attendee from "./attendee";

export const dragSpec = {
  canDrag(props) {
    const { attendeeListItem, eventDetails } = props;
    return eventDetails.mode === RACE_MODE || !attendeeListItem.isAssigned;
  },
  beginDrag(props) {
    const { attendeeListItem } = props;
    
    return {
      draggedAttendeeId: attendeeListItem.attendee.attendeeId,
      draggedAttendeeName: attendeeListItem.attendee.displayName
    };
  }
};

const collect = connect => ({
  connectDragSource: connect.dragSource(),
  connectDragPreview: connect.dragPreview()
});

@DragSource(ATTENDEE_LIST_ITEM, dragSpec, collect)
export default class AttendeeListItem extends Component {
  styles = {
    "marginBottom": "10px"
  };

  componentDidMount() {
    const { connectDragPreview } = this.props;
    connectDragPreview(getEmptyImage());
  }

  render() {
    const {
      attendeeListItem, 
      connectDragSource
    } = this.props;

    return (
      connectDragSource(
        <div style={this.styles}>
          <Attendee attendee={attendeeListItem.attendee} />
        </div>
      )
    );
  }
}