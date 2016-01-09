import { PropTypes } from 'react';
import Email from './Email';

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

export default InviteList;