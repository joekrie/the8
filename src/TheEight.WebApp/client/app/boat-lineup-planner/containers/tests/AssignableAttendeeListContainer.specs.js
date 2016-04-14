import AssignableAttendeeListContainer, { mapStateToProps } from "../AssignableAttendeeListContainer";
import BoatRecord from "../../records/BoatRecord";
import WaterEventRecord from "../../records/WaterEventRecord";
import AttendeeRecord from "../../records/AttendeeRecord";
import { Map, List, Iterable } from "immutable";
import { DragDropContext } from "react-dnd";
import TestBackend from "react-dnd-test-backend";
import { mount } from "enzyme";
import { createStore } from "redux";

describe("<AssignableAttendeeListContainer />", () => {
    it("maps state to props", () => {
        const state = {
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

        const props = mapStateToProps(state);
        expect(props.coxswains.count()).toBe(1);
        expect(props.rowers.count()).toBe(2);
        expect(Iterable.isIterable(props.rowers)).toBe(true);
        expect(props.coxswains.first().attendeeId).toBe("cox-1");
        expect(props.coxswains.find(c => c.attendeeId === "cox-1")).toBeDefined();
        expect(props.coxswains.find(c => c.attendeeId === "rower-1")).not.toBeDefined();
        expect(props.rowers.find(c => c.attendeeId === "cox-1")).not.toBeDefined();
        expect(props.rowers.find(c => c.attendeeId === "rower-1")).toBeDefined();
    });

    it("maps state to props when no coxswains", () => {
        const state = {
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
                })
            ])
        };

        const map = () => mapStateToProps(state);
        expect(map).not.toThrow();
        const props = map();
        expect(Iterable.isIterable(props.coxswains)).toBe(true);
    });

    it("maps state to props when no attendees", () => {
        const state = {
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
            attendees: new List()
        };

        const map = () => mapStateToProps(state);
        expect(map).not.toThrow();
        const props = map();
        expect(Iterable.isIterable(props.rowers)).toBe(true);
        expect(Iterable.isIterable(props.coxswains)).toBe(true);
    });

    it("mounts without error", () => {
        const state = {
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

        const store = createStore(state => state, state);
        const TestComponent = DragDropContext(TestBackend)(AssignableAttendeeListContainer);
        const mountComponent = () => mount(<TestComponent store={store} />);

        expect(mountComponent).not.toThrow();
    });
});