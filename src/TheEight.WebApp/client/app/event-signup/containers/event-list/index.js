import { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import { register, unregister } from "../../action-creators"
import Event from "../../components/event"

export const mapDispatchToProps = dispatch => bindActionCreators({ register, unregister }, dispatch)

export const mapStateToProps = state => {
  const {
    events, 
    settings: { attendeeId }
  } = state
  
  return { events, attendeeId }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class EventList extends Component {
  render() {
    const {
      events,
      register,
      unregister
    } = this.props

    const eventComponents = events.map(item => {
      const {
        isRegistered,
        event: { eventId }
      } = item;
        
      const registerAction = 
        isRegistered 
          ? () => unregister(eventId)
          : () => register(eventId)

      const registerLabel = isRegistered ? "Unregister" : "Register"

      return (
        <Event key={item.event.eventId} eventListItem={item}
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