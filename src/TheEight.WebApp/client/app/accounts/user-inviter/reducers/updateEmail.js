export default (state, action) => {
    const { email, index } = action.payload;
    const newList = state.emails.set(index, email);
    return { emails: newList };
};