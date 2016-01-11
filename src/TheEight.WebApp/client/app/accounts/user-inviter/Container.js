import { Component, PropTypes } from "react";
import { createStore, bindActionCreators } from "redux";
import { Provider, connect } from "react-redux";
import { actionCreators, reducer } from "./actions";
import InviteList from "./components/InviteList";
import BulkParser from "./components/BulkParser";
import ImmutablePropTypes from "react-immutable-proptypes";

class Container extends Component {
	render() {
	    const { emails, addEmail, updateEmail, removeEmail, addBulkEmails } = this.props;

	    return (
            <div>
                <InviteList emails={emails}
                            addEmail={addEmail}
	                        updateEmail={updateEmail}
                            removeEmail={removeEmail} />
                <BulkParser addBulkEmails={addBulkEmails} />
            </div>
        );
	}
}

Container.propTypes = {
    emails: ImmutablePropTypes.listOf(PropTypes.string).isRequired,
    addEmail: PropTypes.func.isRequired,
    updateEmail: PropTypes.func.isRequired,
    removeEmail: PropTypes.func.isRequired,
    addBulkEmails: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    emails: state.emails
});

export default connect(
    mapStateToProps, 
    dispatch => bindActionCreators(actionCreators, dispatch)
)(Container);