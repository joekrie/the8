import { handleActions, createAction } from "redux-actions";
import Immutable from "immutable";
import parseBulkEmails from "./utils/parseBulkEmails";

function addEmail(state) {
    const newList = state.emails.push("");
    return { emails: newList };
}

function addBulkEmails(state, action) {
    const emails = action.payload.emails;
    const emailList = parseBulkEmails(emails);
    const newList = state.emails.push(...emailList);
    return { emails: newList };
}

function removeEmail(state, action) {
    const index = action.payload.index;
    const newList = state.emails.delete(index);
    return { emails: newList };
}

function updateEmail(state, action) {
    const { email, index } = action.payload;
    const newList = state.emails.set(index, email);
    return { emails: newList };
}

const defaultState = {
    emails: Immutable.List()
};

export const reducer = handleActions({
    ADD_EMAIL: addEmail,
    ADD_BULK_EMAILS: addBulkEmails,
    REMOVE_EMAIL: removeEmail,
    UPDATE_EMAIL: updateEmail
}, defaultState);

export const actionCreators = {
    addEmail: createAction("ADD_EMAIL"),
    addBulkEmails: createAction("ADD_BULK_EMAILS"),
    removeEmail: createAction("REMOVE_EMAIL"),
    updateEmail: createAction("UPDATE_EMAIL")
};