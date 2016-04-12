import BoatList from "../presentational-components/BoatList";
import { connect } from "react-redux";
import { actionCreators } from "../reducers";
import { bindActionCreators } from "redux";

export const mapStateToProps = ({ boats }) => {
    const boatList = boats.valueSeq();
    return { boats: boatList };
};

export const mapDispatchToProps = dispatch => bindActionCreators(dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BoatList);