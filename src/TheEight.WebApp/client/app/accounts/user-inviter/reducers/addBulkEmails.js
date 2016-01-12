import {flatten} from "lodash";

const parseBulkEmails = unparsed => {
    const delimiters = [/\r?\n/, ",", ";", " "];
    let splitEmails = [unparsed];

    delimiters.forEach(delimiter => {
        const nested = splitEmails.map(email => email.split(delimiter));
        splitEmails = flatten(nested);
    });

    const emails = splitEmails
        .map(email => email.trim())
        .filter(email => email !== "" && email !== null);

    return emails;
};

export default (state, action) => {
    const emails = action.payload.emails;
    const emailList = parseBulkEmails(emails);
    const newList = state.emails.push(...emailList);
    return { emails: newList };
};