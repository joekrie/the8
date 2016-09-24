import { Component } from "react"

import EventDateField from "../event-date-field"
import EventNotesField from "../event-notes-field"
import WaitingAnimation from "app/common/loading-animation"

export default class EditEventDetailsForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rawValue: this.props.value.toString(),
      isValid: true,
      isShowingDatepicker: false,
      isEditing: false,
      exampleNote: ""
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      rawValue: nextProps.value.toString(),
      isValid: true
    })

    this.datepicker.setValue(nextProps.value.toString())
  }

  onSubmitForm(form) {
    const formData = new FormData(form)
    saveEventDetailsRequest(formData)
  }

  render() {
    const savingOverlayStyles = {
      display: this.props.isSaving ? "inherit" : "none"
    }

    return (
      <div className={styles.editEventDetailsForm}>
        <div styles={savingOverlayStyles} className={styles.savingOverlay}>
          <WaitingAnimation label="Saving" />
        </div>
        <form onSubmit={evt => this.onSubmitForm(evt.target.value)}>
          <EventDateField />
          <EventNotesField />
        </form>
      </div>
    )
  }
}
