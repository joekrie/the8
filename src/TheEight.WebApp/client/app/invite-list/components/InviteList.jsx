import { PropTypes } from 'react';
import Email from './Email';

const createEmail = (email, index, deleteEmail) => (
    <Email />
);

export default InviteList = (props) => {
    const { emails, deleteEmail } = props;

    return (
        <div className='boat-list'>
            {emails.map((email, index) => createEmail(email, index, deleteEmail))}
        </div>
    );
};

InviteList.propTypes = {
    
};