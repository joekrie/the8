import { bindActionCreators } from "redux"

export const mapStateToProps = state => ({
  canAttendeeOccupyMultipleBoats: state.eventDetails.mode === RACE_MODE 
})

export const mapDispatchToProps = dispatch => bindActionCreators({ assignAttendee, unassignAttendee }, dispatch)
