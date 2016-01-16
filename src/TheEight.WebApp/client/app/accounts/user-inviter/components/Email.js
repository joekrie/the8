import { PropTypes } from "react";
import Radium from "radium";

const Email = props => {
    const { removeEmail, updateEmail, email, index } = props;

    const handleChangeEmail = event => {
        const newEmail = event.target.value;
        updateEmail({ index, email: newEmail });
    };

    const handleRemoveEmail = () => { removeEmail({ index }); };

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

Email.propTypes = {
    removeEmail: PropTypes.func.isRequired,
    updateEmail: PropTypes.func.isRequired,
    email: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired
};

export default Radium(Email);