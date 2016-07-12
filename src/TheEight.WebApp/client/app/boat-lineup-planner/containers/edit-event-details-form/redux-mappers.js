import { bindActionCreators } from "redux"

export const mapDispatchToProps = dispatch => 
  bindActionCreators({
    saveEventDetails
  }, dispatch)