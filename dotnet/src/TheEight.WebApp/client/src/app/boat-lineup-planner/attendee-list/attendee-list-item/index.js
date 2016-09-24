import { Component } from "react"
import { getEmptyImage } from "react-dnd-html5-backend"

import Attendee from "../attendee"
import dragSource from "./dnd"

@dragSource
export default class AttendeeListItem extends Component {
  componentDidMount() {
    //this.props.connectDragPreview(getEmptyImage())  // todo: add drag handle
  }

  render() {
    return (
      this.props.connectDragSource(
        <div className={styles.root}>
          <Attendee attendee={this.props.attendee} />
        </div>
      )
    )
  }
}
