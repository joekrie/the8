import { handleActions } from 'redux-actions';
import Immutable from 'immutable';

function addEmail(state) {
    const newList = state.emails.push('');
    return { emails: newList };
}

function removeEmail(state, action) {
    const { index } = action.payload;
    const newList = state.emails.delete(index);
    return { emails: newList };
}

function updateEmail(state, action) {
    const { email, index } = action.payload;
    const newList = state.emails.set(index, email);
    return { emails: newList };
}

export default handleActions({
    ADD_EMAIL: addEmail,
    REMOVE_EMAIL: removeEmail,
    UPDATE_EMAIL: updateEmail
}, {
    emails: Immutable.fromJS(['dsh', 'y76ydtf'])
});