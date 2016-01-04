import { handleActions } from 'redux-actions';
import Immutable from 'immutable';

function addEmail(state, action) {
    const { newEmail } = action.payload;

    const newList = state
        .get('emails')
        .push(newEmail);

    state.set('emails', newList);
}

function removeEmail(state, action) {
    const { index } = action.payload;

    const newList = state
        .get('emails')
        .delete(index);

    state.set('emails', newList);
}

function updateEmail(state, action) {
    const { email, index } = action.payload;

    const newList = state
        .get('emails')
        .set(index, email);

    state.set('emails', newList);
}

export default handleActions({
    ADD_EMAIL: addEmail,
    REMOVE_EMAIL: removeEmail,
    UPDATE_EMAIL: updateEmail,
}, Immutable.fromJS({
    emails: []
}));