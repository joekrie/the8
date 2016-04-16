import { Component } from "react";
import Radium from "radium";
import { Provider } from "react-redux";
import reducer from "./reducer";
import { List, Map } from "immutable";
import { createStore } from "redux";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import AssignableAttendeeListContainer from "./containers/AssignableAttendeeListContainer";
import BoatListContainer from "./containers/BoatListContainer";
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
            title: "Lucky",
            seatCount: 4,
            isCoxed: true,
            seatAssignments: Map([
                [1, "rower-1"]
            ])
        }),
        "boat-2": new BoatRecord({
            boatId: "boat-1",
            title: "Voyager 1",
            seatCount: 2,
            isCoxed: false,
            seatAssignments: Map()
        })
    }),
    attendees: new List([ 
        new AttendeeRecord({
            attendeeId: "cox-1",
            sortName: "Hill, Dule",
            displayName: "Dule Hill",
            isCoxswain: true
        }),
        new AttendeeRecord({
            attendeeId: "rower-1",
            sortName: "Sheen, Martin",
            displayName: "Martin Sheen"
        }),
        new AttendeeRecord({
            attendeeId: "rower-2",
            sortName: "Lowe, Rob",
            displayName: "Rob Lowe"
        }),
        new AttendeeRecord({
            attendeeId: "rower-3",
            sortName: "Schiff, Richard",
            displayName: "Richard Schiff"
        }),
        new AttendeeRecord({
            attendeeId: "rower-4",
            sortName: "Janney, Allison",
            displayName: "Allison Janney"
        }),
        new AttendeeRecord({
            attendeeId: "rower-5",
            sortName: "Spencer, John",
            displayName: "John Spencer"
        })
    ])
};

const store = createStore(reducer, Object.create(sampleState));

@DragDropContext(HTML5Backend)
@Radium
export default class extends Component {
    render() {
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