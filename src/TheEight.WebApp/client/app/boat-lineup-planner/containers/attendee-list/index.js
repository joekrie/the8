import { List } from "immutable"
import { Component } from "react"
import { DropTarget } from "react-dnd"
import { connect } from "react-redux"

import AttendeeListItem from "boat-lineup-planner/components/attendee-list-item"
import EventDetails from "boat-lineup-planner/components/event-details"
import BoatCreator from "boat-lineup-planner/components/boat-creator"
import AttendeeCreator from "boat-lineup-planner/components/attendee-creator"

import { defaultDropCollect } from "common/dnd-defaults"
import { ASSIGNED_ATTENDEE } from "boat-lineup-planner/dnd-item-types"
import { RACE_MODE } from "boat-lineup-planner/models/event-modes"
import AttendeeListItemRecord from "boat-lineup-planner/models/attendee-list-item-record"

import { unassignAttendee } from "boat-lineup-planner/action-creators/unassign-attendee"
import { saveEventDetailsRequest } from "boat-lineup-planner/action-creators/save-event-details"
import { moveAttendeesRequest } from "boat-lineup-planner/action-creators/move-attendees"
import { addBoat } from "boat-lineup-planner/action-creators/add-boat"
import { addAttendee } from "boat-lineup-planner/action-creators/add-attendee"

import { mapStateToProps, mapDispatchToProps } from "./redux-specs"

import "./styles.scss"

@connect(mapStateToProps, mapDispatchToProps)
@DropTarget(ASSIGNED_ATTENDEE, dropSpec, defaultDropCollect)
export default class AttendeeList extends Component {
  render() {
    const { 
      attendeeListItems, 
      connectDropTarget, 
      eventDetails, 
      changeEventDetails, 
      createBoat, 
      createAttendee 
    } = this.props

    const attendeeComponents = attendeeListItems
      .filter(item => eventDetails.mode === RACE_MODE || !item.isAssigned)
      .map(item =>
        <AttendeeListItem key={item.attendee.attendeeId} attendeeListItem={item} 
          eventDetails={eventDetails} />
      )

    return connectDropTarget(
      <div className="card attendee-list">
        <h1 className="card-header">
          Boat Lineups
        </h1>
        <div className="card-block">
          <EventDetails eventDetails={eventDetails} changeEventDetails={changeEventDetails} />
          <BoatCreator createBoat={createBoat} />
          <AttendeeCreator createAttendee={createAttendee} />
          <div className="list-items">
            {attendeeComponents}
          </div>
        </div>
      </div>
    )
  }
}
