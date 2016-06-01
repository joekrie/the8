import Radium from "radium";
import { Component } from "react";
import { DropTarget } from "react-dnd";

import { defaultDropCollect } from "../../common/dnd-defaults";
import AttendeeListItem from "./attendee-list-item";
import * as ItemTypes from "../item-types";

export const dropSpec = {
  drop(props, monitor) {
    const { unassignAttendee } = props;
    const { originBoatId, originSeatNumber } = monitor.getItem();
    unassignAttendee(originBoatId, originSeatNumber);
  }
};

@Radium
@DropTarget(ItemTypes.ASSIGNED_ATTENDEE, dropSpec, defaultDropCollect)
export default class AttendeeList extends Component {
  render() {
    const { attendeeListItems, connectDropTarget } = this.props;

    const attendeeComponents = attendeeListItems.map(item =>
      <AttendeeListItem key={item.attendee.attendeeId} attendeeListItem={item} />
    );

    const styles = {
      root: {
        "float": "left",
        "width": "300px",
        "backgroundColor": "#263751",
        "marginRight": "20px"
      },
      attendeeList: {
        "padding": "15px"
      },
      attendee: {
        "marginBottom": "10px"
      },
      header: {
        "backgroundColor": "#263F52",
        "color": "#F5F5F5",
        "marginBottom": "10px",
        "padding": "10px"
      }
    };

    return connectDropTarget(
      <div style={styles.root}>
        <div style={styles.header}>
          Unassigned
        </div>
        <div style={styles.attendeeList}>
          {attendeeComponents}
        </div>
      </div>
    );
  }
};