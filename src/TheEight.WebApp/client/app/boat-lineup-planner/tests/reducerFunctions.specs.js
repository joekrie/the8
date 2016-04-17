import { placeAttendees } from "../reducerFunctions";
import { Map, List } from "immutable";
import BoatRecord from "../records/BoatRecord";
import SeatRecord from "../records/SeatRecord";
import AttendeeRecord from "../records/AttendeeRecord";

describe("Boat lineup planner reducer functions", () => {
    describe("unassignAttendee", () => {
        it("unassigns an assigned seat", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        seatAssignments: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [],
                    unassignments: [
                        new SeatRecord({
                            boatId: "boat-1",
                            seatNumber: 1
                        })
                    ]
                }
            };

            const newState = placeAttendees(prevState, action);
            const newBoat = newState.boats.get("boat-1");
            expect(newBoat.isSeatAssigned(1)).toBe(false);
        } );

        it("unassignment from an unassigned seat doesn't throw error", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        seatAssignments: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [],
                    unassignments: [
                        new SeatRecord({
                            boatId: "boat-1",
                            seatNumber: 1
                        })
                    ]
                }
            };

            const reduce = () => placeAttendees(prevState, action);
            expect(reduce).not.toThrow();
        });

        it("unassignment from nonexistant boat doesn't throw error", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        seatAssignments: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [],
                    unassignments: [
                        new SeatRecord({
                            boatId: "boat-2",
                            seatNumber: 1
                        })
                    ]
                }
            };

            const reduce = () => placeAttendees(prevState, action);
            expect(reduce).not.toThrow();
        });

        it("assigns to unassigned seat", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        seatAssignments: Map()
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        {
                            attendeeId: "rower-1",
                            seat: new SeatRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        }
                    ],
                    unassignments: []
                }
            };

            const newState = placeAttendees(prevState, action);
            const newBoat = newState.boats.get("boat-1");
            const assignedAttendee = newBoat.seatAssignments.get(1);
            expect(assignedAttendee).toBe("rower-1");
        });

        it("assigns to assigned seat", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        seatAssignments: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        {
                            attendeeId: "rower-2",
                            seat: new SeatRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        }
                    ],
                    unassignments: []
                }
            };

            const reduce = () => placeAttendees(prevState, action);
            expect(reduce).not.toThrow();
            const newState = reduce();
            const newBoat = newState.boats.get("boat-1");
            const assignedAttendee = newBoat.seatAssignments.get(1);
            expect(assignedAttendee).toBe("rower-2");
        });

        it("can swap assigned attendees within boat", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        seatAssignments: Map([
                            [1, "rower-1"],
                            [2, "rower-2"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        {
                            attendeeId: "rower-2",
                            seat: new SeatRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        },
                        {
                            attendeeId: "rower-1",
                            seat: new SeatRecord({
                                boatId: "boat-1",
                                seatNumber: 2
                            })
                        }
                    ],
                    unassignments: []
                }
            };

            const reduce = () => placeAttendees(prevState, action);
            expect(reduce).not.toThrow();
            const newState = reduce();
            const newBoat = newState.boats.get("boat-1");
            const assignedAttendee = newBoat.seatAssignments.get(1);
            expect(assignedAttendee).toBe("rower-2");
        });

        it("can swap assigned attendees across boats", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        seatAssignments: Map([
                            [1, "rower-1"]
                        ])
                    }),
                    "boat-2": new BoatRecord({
                        seatAssignments: Map([
                            [1, "rower-2"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        {
                            attendeeId: "rower-2",
                            seat: new SeatRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        },
                        {
                            attendeeId: "rower-1",
                            seat: new SeatRecord({
                                boatId: "boat-1",
                                seatNumber: 2
                            })
                        }
                    ],
                    unassignments: []
                }
            };

            const reduce = () => placeAttendees(prevState, action);
            expect(reduce).not.toThrow();
            const newState = reduce();
            const newBoat = newState.boats.get("boat-1");
            const assignedAttendee = newBoat.seatAssignments.get(1);
            expect(assignedAttendee).toBe("rower-2");
        });
    });

    it("keeps attendees property when changing boats", () => {
        const prevState = {
            attendees: List([
                new AttendeeRecord({
                    attendeeId: "rower-1"
                })
            ]),
            boats: Map({
                "boat-1": new BoatRecord({
                    seatAssignments: Map()
                })
            })
        };

        const action = {
            payload: {
                assignments: [
                    {
                        attendeeId: "rower-1",
                        seat: new SeatRecord({
                            boatId: "boat-1",
                            seatNumber: 1
                        })
                    }
                ],
                unassignments: []
            }
        };

        const newState = placeAttendees(prevState, action);
        const attendee = newState.attendees.first();
        expect(attendee.attendeeId).toBe("rower-1");
    });
});