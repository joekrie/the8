import { mount } from "enzyme"
import { DragDropContext } from "react-dnd"
import { Iterable } from "immutable"

import mapServerDataToState, { mapBoats, mapAttendees, } from "../map-server-data-to-state"

describe("Boat lineup planner server-data-to-state mapper", () => {
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
        ]

        const stateBoats = mapBoats(serverBoats)

        expect(Iterable.isIterable(stateBoats)).toBe(true)
        expect(stateBoats.count()).toBe(2)
        expect(stateBoats.sortBy(b => b.boatId).first().boatId).toBeTruthy()
        expect(stateBoats.sortBy(b => b.boatId).first().seatAssignments.count()).toBe(1)
        expect(stateBoats.sortBy(b => b.boatId).first().seatAssignments.get(1)).toBe("rower-1")
    })

    it("maps attendees", () => {
        const serverAttendees = [
            {
                attendeeId: "rower-1",
                displayName: "Rower 1",
                sortName: "1, Rower",
                isCoxswain: false
            },
            {
                attendeeId: "cox-1",
                displayName: "Coxswain 1",
                sortName: "1, Coxswain",
                isCoxswain: true
            }
        ]

        const stateAttendees = mapAttendees(serverAttendees)

        expect(Iterable.isIterable(stateAttendees)).toBe(true)
        expect(stateAttendees.count()).toBe(2)
        expect(stateAttendees.sortBy(a => a.attendeeId).first().attendeeId).toBeTruthy()
        expect(stateAttendees.sortBy(a => a.attendeeId).first().isCoxswain).toBe(true)
    })

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
        }

        const state = mapServerDataToState(serverData)

        expect(Iterable.isIterable(state.eventSettings)).toBe(true)
        expect(Iterable.isIterable(state.boats)).toBe(true)
        expect(Iterable.isIterable(state.attendees)).toBe(true)
    })
})
