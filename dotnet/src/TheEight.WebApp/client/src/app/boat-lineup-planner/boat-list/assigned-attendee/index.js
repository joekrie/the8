import { Component } from "react"
import { DragSource } from "react-dnd"
import { compose } from "recompose"
import { observer, inject } from "mobx-react"
import { css, StyleSheet } from "aphrodite"

import Attendee from "./Attendee"

function AssignedAttendee(props) {
  const isCoxSeat = props.seat.number === 0
  const isPort = props.seat.number % 2
  const attendeePosition = props.seat.attendee.position
  
  let isOutOfPosition = false
  
  if (isCoxSeat) {
    isOutOfPosition = attendeePosition != "COXSWAIN"
  } else {
    if (attendeePosition == "BISWEPTUAL_ROWER") {
      isOutOfPosition = !isCoxSeat
    } else {
      if (isPort) {
        isOutOfPosition = attendeePosition == "PORT_ROWER"
      } else {
        isOutOfPosition = attendeePosition == "STARBOARD_ROWER"
      }
    }
  }
  
  return props.connectDragSource(
    <div className={css(styles.root)}>
      <Attendee attendee={props.seat.attendee} isOutOfPosition={isOutOfPosition} />
    </div>
  )
}

const styles = StyleSheet.create({
  root: {
    marginBottom: "10px"
  }
})

function beginDrag(props) {
  props.seat.attendee.startDragging()
  
  return { 
    boat: props.boat, 
    seat: props.seat, 
    attendee: props.seat.attendee 
  }
}

function endDrag(props) {
  props.seat.attendee.stopDragging()
}

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

export default compose(
  DragSource("ASSIGNED_ATTENDEE", { beginDrag, endDrag }, dragCollect),
  observer
)(AssignedAttendee)
