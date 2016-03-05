export default state => {
    const newList = state.emails.push("");
    return { emails: newList };
};