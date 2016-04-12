import mapServerDataToState, { mapBoats } from "../mapServerDataToState";

describe("Map boat lineup planner server data to state", () => {
    it("maps boats", () => {
        const serverBoats = [
            {
                boatId: "boat-1",
                title: "Boat 1",
                isCoxed: false,
                seatCount: 2,
                seatAssignments: {
                    1: "rower-1"
                }
            },
            {
                boatId: "boat-2",
                title: "Boat 2",
                isCoxed: true,
                seatCount: 4,
                seatAssignments: {}
            }
        ];

        const stateBoats = mapBoats(serverBoats);
        console.log(stateBoats);
    });

    it("maps basic data", () => {
        const serverData = {
            eventSettings: {
                eventId: "event-1",
                title: "",
                allowMultipleAttendeeAssignments: false
            },
            boats: [
                {
                    boatId: "boat-1",
                    title: "Boat 1",
                    isCoxed: true,
                    seatCount: 2,
                    seatAssignments: {
                        1: "rower-1"
                    }
                }
            ],
            attendees: [
                {
                    attendeeId: "rower-1",
                    displayName: "Rower 1",
                    sortName: "1, Rower",
                    isCoxswain: false
                }
            ]
        };

        const state = mapServerDataToState(serverData);
        console.log(state);
    });
});