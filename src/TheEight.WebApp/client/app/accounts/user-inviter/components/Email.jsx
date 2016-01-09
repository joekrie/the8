import { PropTypes } from 'react';

const Email = props => {
    const { removeEmail, updateEmail, email, index } = props;

    const handleChangeEmail = event => {
        const newEmail = event.target.value;
        updateEmail({ index, email: newEmail });
    };

    const handleRemoveEmail = () => {
        removeEmail({index});
    };

    return (
        <div>
            <input type="text" 
                   value={email} 
                   onChange={handleChangeEmail} />
            <button onClick={handleRemoveEmail}>
                X
            </button>
        </div>
    );
};

export default Email;