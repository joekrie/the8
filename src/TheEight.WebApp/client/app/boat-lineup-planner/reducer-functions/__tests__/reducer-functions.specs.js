import { Map, List } from "immutable";

import { placeAttendees } from "../reducer-functions";
import BoatRecord from "../boat.record";
import SeatRecord from "../seat.record";
import SeatInfoRecord from "../seat-info.record";

describe("Boat lineup planner reducer functions", () => {
    describe("unassignAttendee", () => {
        it("unassigns an assigned seat", () => {
            const prevState = {
                boats: Map({
                    "boat-1": new BoatRecord({
                        assignedSeats: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [],
                    unassignments: [
                        new SeatInfoRecord({
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
                        assignedSeats: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [],
                    unassignments: [
                        new SeatInfoRecord({
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
                        assignedSeats: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [],
                    unassignments: [
                        new SeatInfoRecord({
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
                        assignedSeats: Map()
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        new SeatRecord({
                            attendeeId: "rower-1",
                            seatInfo: new SeatInfoRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        })
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
                        assignedSeats: Map([
                            [1, "rower-1"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        new SeatRecord({
                            attendeeId: "rower-2",
                            seatInfo: new SeatInfoRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        })
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
                        assignedSeats: Map([
                            [1, "rower-1"],
                            [2, "rower-2"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        new SeatRecord({
                            attendeeId: "rower-2",
                            seatInfo: new SeatInfoRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        }),
                        new SeatRecord({
                            attendeeId: "rower-1",
                            seatInfo: new SeatInfoRecord({
                                boatId: "boat-1",
                                seatNumber: 2
                            })
                        })
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
                        assignedSeats: Map([
                            [1, "rower-1"]
                        ])
                    }),
                    "boat-2": new BoatRecord({
                        assignedSeats: Map([
                            [1, "rower-2"]
                        ])
                    })
                })
            };

            const action = {
                payload: {
                    assignments: [
                        new SeatRecord({
                            attendeeId: "rower-2",
                            seatInfo: new SeatInfoRecord({
                                boatId: "boat-1",
                                seatNumber: 1
                            })
                        }),
                        new SeatRecord({
                            attendeeId: "rower-1",
                            seatInfo: new SeatInfoRecord({
                                boatId: "boat-1",
                                seatNumber: 2
                            })
                        })
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
});