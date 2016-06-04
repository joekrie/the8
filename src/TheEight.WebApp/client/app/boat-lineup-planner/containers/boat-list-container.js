import { connect } from "react-redux";

import BoatList from "../components/boat-list";

export const mapStateToProps = ({ boats }) => ({ boats });
export const BoatListContainer = connect(mapStateToProps)(BoatList);

export default BoatListContainer