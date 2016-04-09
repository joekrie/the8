import Immutable from "immutable";

export default {
    event: Immutable.fromJS({
        settings: {
            allowMultipleAssignments: false
        },
        attendees: [],
        boats: []
    })
};