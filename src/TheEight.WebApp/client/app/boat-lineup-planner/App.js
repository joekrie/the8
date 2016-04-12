import { Component } from "react";
import { Provider, connect } from "react-redux";
import { reducer } from "./reducers";
import { List, Map } from "immutable";
import { createStore } from "redux";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import AssignableAttendeeListContainer from "./containers/AssignableAttendeeListContainer";
import BoatListContainer from "./containers/BoatListContainer";
import Radium from "radium";
import BoatRecord from "./records/BoatRecord";
import WaterEventRecord from "./records/WaterEventRecord";
import AttendeeRecord from "./records/AttendeeRecord";

const styles = {
    root: {
        "position": "absolute",
        "height": "100%"
    }
};

const sampleState = {
    eventSettings: new WaterEventRecord({
        allowMultipleAttendeeAssignments: true
    }),
    boats: new Map({
        "boat-1": new BoatRecord({
            boatId: "boat-1",
            seatAssignments: Map([
                [1, "rower-1"]
            ])
        })
    }),
    attendees: new List([
        new AttendeeRecord({
            attendeeId: "rower-1",
            isCoxswain: false
        }),
        new AttendeeRecord({
            attendeeId: "rower-2",
            isCoxswain: false
        }),
        new AttendeeRecord({
            attendeeId: "cox-1",
            isCoxswain: true
        })
    ])
};

@DragDropContext(HTML5Backend)
@Radium
export default class extends Component {
    render() {
        const store = createStore(reducer, Object.create(sampleState));

        return (
            <Provider store={store}>
                <div style={styles.root}>
                    <AssignableAttendeeListContainer />
                    <BoatListContainer />
                </div>
            </Provider>
        );
    }
}