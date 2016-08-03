import { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import DateField from "boat-lineup-planner/app/components/date-field"
import NotesField from "boat-lineup-planner/app/components/notes-field"
import LoadingAnimation from "common/components/loading-animation"

import { saveEventDetailsRequest } from "boat-lineup-planner/action-creators/save-event-details"

import { mapDispatchToProps } from "./redux-specs"

import "./edit-event-details-form.component.scss"

export const mapDispatchToProps = dispatch => 
  bindActionCreators({
    saveEventDetails
  }, dispatch)

@connect(null, mapDispatchToProps)
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
    const { isSaving } = this.props

    const styles = {
      savingOverlay: {
        display: isSaving ? "inherit" : "none"
      }
    }

    return (
      <div className="edit-event-details-form">
        <div styles={styles.savingOverlay} className="saving-overlay">
          <LoadingAnimation label="Saving" />
        </div>
        <form onSubmit={evt => this.onSubmitForm(evt.target.value)}>
          <DateField />
          <NotesField />
        </form>
      </div>
    )
  }
}
