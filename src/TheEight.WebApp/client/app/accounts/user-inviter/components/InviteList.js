import { PropTypes } from "react";
import Email from "./Email";
import ImmutablePropTypes from "react-immutable-proptypes";

const InviteList = props => {
    const { emails, addEmail, removeEmail, updateEmail } = props;

    const handleAddEmail = () => addEmail();
    
    return (
        <div>
            {emails.map((email, index) => 
                <Email email={email}
                       index={index}
                       key={index} 
                       removeEmail={removeEmail} 
                       updateEmail={updateEmail} />)}
            <button type="button" onClick={handleAddEmail}>
                +
            </button>
        </div>
    );
};

InviteList.propTypes = {
    emails: ImmutablePropTypes.listOf(PropTypes.string).isRequired,
    addEmail: PropTypes.func.isRequired,
    removeEmail: PropTypes.func.isRequired,
    updateEmail: PropTypes.func.isRequired
};

export default InviteList;