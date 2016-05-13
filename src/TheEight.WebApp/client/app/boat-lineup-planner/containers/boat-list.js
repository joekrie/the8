import { Map } from "immutable";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import BoatList from "../components/boat-list";
import { placeAttendees } from "../action-creators";

const mapStateToProps = ({ boats }) => ({ boats });
const BoatListContainer = connect(mapStateToProps)(BoatList);

export default BoatListContainer