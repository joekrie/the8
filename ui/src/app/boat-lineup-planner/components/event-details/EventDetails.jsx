import { PropTypes } from "react"
import { observer } from "mobx-react"

import AttendeeList from "./AttendeeList"
//import BoatCreator from "./BoatCreator"
//import AttendeeCreator from "./AttendeeCreator"

import "./EventDetails.scss"

function EventDetails(props) {
  return (
    <div className="event-details card">
      <div className="card-block">
        {/*<BoatCreator createBoat={props.createBoat} />
        <AttendeeCreator createAttendee={props.createAttendee} />*/}
        <AttendeeList />
      </div>
    </div>
  )
}

export default observer(EventDetails)
