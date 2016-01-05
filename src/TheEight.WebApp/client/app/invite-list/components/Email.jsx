import { PropTypes } from 'react';

export default Email = (props) => {
    const {  deleteEmail } = props;

    return (
        <div>
            <input type='hidden' />
            <input type='text' />
            <select>
                <option value=''>

                </option>
            </select>
            <button onClick={deleteEmail}>
                Delete
            </button>
        </div>
    );
};

Email.propTypes = {
    deleteEmail: PropTypes.func.isRequired
};