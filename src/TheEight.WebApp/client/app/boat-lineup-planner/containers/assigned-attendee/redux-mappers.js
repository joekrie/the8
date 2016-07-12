import { bindActionCreators } from "redux"

export const mapStateToProps = ({ attendees }, { attendeeId }) => {
  const attendee = attendees.find(attn => attn.attendeeId === attendeeId)
  return { attendee }
}
