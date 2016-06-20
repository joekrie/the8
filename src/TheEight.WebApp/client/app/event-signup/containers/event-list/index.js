import { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import { register, unregister } from "../../action-creators"
import Event from "../../components/event"

export const mapDispatchToProps = dispatch => bindActionCreators({ register, unregister }, dispatch)

export const mapStateToProps = state => {
  const {
    events,
    attendee
  } = state
  
  return { events, attendee }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class EventList extends Component {
  render() {
    const {
      events,
      register,
      unregister,
      attendee
    } = this.props

    const eventComponents = events.map(item => {
      const {
        isRegistered,
        event: { eventId },
        otherAttendees
      } = item
        
      const registerAction = 
        isRegistered 
          ? () => unregister(eventId)
          : () => register(eventId)

      const registerLabel = isRegistered ? "Unregister" : "Register"

      const attendees =
        isRegistered
          ? otherAttendees.unshift(attendee)
          : otherAttendees

      return (
        <Event key={item.event.eventId} eventListItem={item} attendees={attendees}
          registerAction={registerAction} registerLabel={registerLabel} />
      )
    }).valueSeq()

    return (
      <div className="container">
        {eventComponents}
      </div>
    )
  }
}