import { random } from "lodash"
import { Component } from "react"
import { LocalDate } from "js-joda"

//import EditEventDetailsForm from "./edit-event-details-form.component"

export default class EventDetails extends Component {
  render() {
    const date = LocalDate.parse("2016-09-24")
    const notes = "These are some notes"
    
    return (
      <div>

      </div>
    )
  }
}
