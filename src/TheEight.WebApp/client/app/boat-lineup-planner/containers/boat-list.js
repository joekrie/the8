import { connect } from "react-redux";

import BoatList from "../components/boat-list";

const mapStateToProps = ({ boats }) => ({ boats });
const BoatListContainer = connect(mapStateToProps)(BoatList);

export default BoatListContainer