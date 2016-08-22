import { Component } from "react"
import { connect } from "react-redux"
import { bindActionCreators } from "redux"

import DateField from "./date-field.component"
import NotesField from "./notes-field.component"
import LoadingAnimation from "app/common/components/loading-animation.component"

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
    const styles = {
      savingOverlay: {
        display: this.props.isSaving ? "inherit" : "none"
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
