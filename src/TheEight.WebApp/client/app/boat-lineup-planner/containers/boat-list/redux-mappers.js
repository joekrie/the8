export const mapStateToProps = ({ boats }) => ({
  boats: boats.valueSeq()
})