import { Component } from "react";
import { DragSource } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import Attendee from "boat-lineup-planner/components/attendee";

import { dragSpec, dragCollect } from "./dnd"

import "./styles.scss"

@DragSource("ATTENDEE_LIST_ITEM", dragSpec, dragCollect)
export default class AttendeeListItem extends Component {
  componentDidMount() {
    const { connectDragPreview } = this.props;
    connectDragPreview(getEmptyImage());
  }

  render() {
    const { attendeeListItem, connectDragSource } = this.props;

    return (
      connectDragSource(
        <div className="attendee-list-item">
          <Attendee attendee={attendeeListItem.attendee} />
        </div>
      )
    )
  }
}
