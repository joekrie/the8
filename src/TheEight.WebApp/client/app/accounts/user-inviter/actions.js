import { handleActions, createAction } from "redux-actions";
import Immutable from "immutable";
import addEmail from "./reducers/addEmail";
import addBulkEmails from "./reducers/addBulkEmails";
import updateEmail from "./reducers/updateEmail";
import removeEmail from "./reducers/removeEmail";

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