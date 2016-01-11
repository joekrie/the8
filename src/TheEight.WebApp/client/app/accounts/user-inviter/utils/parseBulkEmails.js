import {flatten} from "lodash";

export default function(unparsed) {
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
}