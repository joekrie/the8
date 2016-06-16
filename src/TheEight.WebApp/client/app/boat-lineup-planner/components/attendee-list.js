import { Component } from "react";
import { DropTarget } from "react-dnd";

import { defaultDropCollect } from "../../common/dnd-defaults";
import AttendeeListItem from "./attendee-list-item";
import { ASSIGNED_ATTENDEE } from "../item-types";
import EventDetails from "./event-details";
import { RACE_MODE } from "../models/event-modes";
import BoatCreator from "./boat-creator";
import AttendeeCreator from "./attendee-creator";

export const dropSpec = {
  drop(props, monitor) {
    const { unassignAttendee } = props;
    const { originBoatId, originSeatNumber } = monitor.getItem();
    unassignAttendee(originBoatId, originSeatNumber);
  }
};

@DropTarget(ASSIGNED_ATTENDEE, dropSpec, defaultDropCollect)
export default class AttendeeList extends Component {
  render() {
    const { attendeeListItems, connectDropTarget, eventDetails, changeEventDetails, createBoat, createAttendee } = this.props;

    const attendeeComponents = attendeeListItems
      .filter(item => eventDetails.mode === RACE_MODE || !item.isAssigned)
      .map(item =>
        <AttendeeListItem key={item.attendee.attendeeId} attendeeListItem={item} 
          eventDetails={eventDetails} />
      );

    const styles = {
      root: {
        "float": "left",
        "width": "300px",
        "border": "1px solid black",
        "height": "100%"
      },
      attendeeList: {
        "paddingTop": "15px"
      }
    };

    return connectDropTarget(
      <div className="container" style={styles.root}>
        <EventDetails eventDetails={eventDetails} changeEventDetails={changeEventDetails} />
        <BoatCreator createBoat={createBoat} />
        <AttendeeCreator createAttendee={createAttendee} />
        <div style={styles.attendeeList}>
          {attendeeComponents}
        </div>
      </div>
    );
  }
};