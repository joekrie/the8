import AssignableAttendeeListContainer, { mapStateToProps, attendeeIsAssignable } from "../AssignableAttendeeListContainer";
import BoatRecord from "../../records/BoatRecord";
import WaterEventRecord from "../../records/WaterEventRecord";
import AttendeeRecord from "../../records/AttendeeRecord";
import { Map, List, Iterable } from "immutable";
import { createStore } from "redux";

describe("<AssignableAttendeeListContainer />", () => {
    it("maps state to props", () => {
        const state = {
            eventSettings: new WaterEventRecord({
                allowMultipleAttendeeAssignments: true
            }),
            boats: Map({
                "boat-1": new BoatRecord({
                    boatId: "boat-1",
                    seatAssignments: Map([
                        [1, "rower-1"]
                    ])
                })
            }),
            attendees: List([
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

        const { rowers, coxswains } = mapStateToProps(state);

        expect(coxswains.count()).toBe(1);
        expect(rowers.count()).toBe(2);
        expect(Iterable.isIterable(rowers)).toBe(true);
        expect(coxswains.first().attendeeId).toBe("cox-1");
        expect(coxswains.find(c => c.attendeeId === "cox-1")).toBeDefined();
        expect(coxswains.find(c => c.attendeeId === "rower-1")).not.toBeDefined();
        expect(rowers.find(c => c.attendeeId === "cox-1")).not.toBeDefined();
        expect(rowers.find(c => c.attendeeId === "rower-1")).toBeDefined();
    });

    it("maps state to props when multiple assignments prohibited", () => {
        const state = {
            eventSettings: new WaterEventRecord({
                allowMultipleAttendeeAssignments: false
            }),
            boats: Map({
                "boat-1": new BoatRecord({
                    boatId: "boat-1",
                    seatAssignments: Map([
                        [1, "rower-1"]
                    ])
                })
            }),
            attendees: List([
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
        
        const { rowers } = mapStateToProps(state);

        expect(rowers.find(c => c.attendeeId === "rower-1")).not.toBeDefined();
        expect(rowers.find(c => c.attendeeId === "rower-2")).toBeDefined();
    });

    it("checks if attendee is assignable", () => {
        const boats = Map({
            "boat-1": new BoatRecord({
                boatId: "boat-1",
                seatAssignments: Map([
                    [1, "rower-1"]
                ])
            })
        });

        const attendeeInBoat =
            new AttendeeRecord({
                attendeeId: "rower-1",
                isCoxswain: false
            });

        const attendeeNotInBoat =
            new AttendeeRecord({
                attendeeId: "rower-2",
                isCoxswain: false
            });

        const allowMultipleInBoat = attendeeIsAssignable(attendeeInBoat, boats, true);
        const allowMultipleNotInBoat = attendeeIsAssignable(attendeeNotInBoat, boats, true);
        const prohibitMultipleInBoat = attendeeIsAssignable(attendeeInBoat, boats, false);
        const prohibitMultipleNotInBoat = attendeeIsAssignable(attendeeNotInBoat, boats, false);
        
        expect(allowMultipleInBoat).toBe(true);
        expect(allowMultipleNotInBoat).toBe(true);
        expect(prohibitMultipleInBoat).toBe(false);
        expect(prohibitMultipleNotInBoat).toBe(true);
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
        testUtils.expectToMountWithoutError(AssignableAttendeeListContainer, { store });
    });
});