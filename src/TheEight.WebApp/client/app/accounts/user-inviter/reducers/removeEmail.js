export default (state, action) => {
    const index = action.payload.index;
    const newList = state.emails.delete(index);
    return { emails: newList };
};