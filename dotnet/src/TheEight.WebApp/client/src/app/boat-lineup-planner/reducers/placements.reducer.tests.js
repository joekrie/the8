import { Map, fromJS } from "immutable"

import PlacementsStateRecord, { Placer, Unplacer, commitPlacementChanges } from "../placements-state.record"

describe("boat-lineup-planner > records > placements-state-record > PlacementsStateRecord", () => {
  it("should commit changes after placing attendee in an empty seat", () => {
    // arrange
    let state = new PlacementsStateRecord()

    // act
    state = state
      .placeAttendee("attn-1", "boat-1", "2")
      .commitPlacementChanges()

    // assert
    expect(state.currentRevision.getIn(["boat-1", "2"])).toBe("attn-1")
  })

  it("should commit changes after swapping attendees", () => {
    // arrange
    let state = new PlacementsStateRecord({
      committed: fromJS({
        "boat-1": {
          "3": "attn-2"
        },
        "boat-2": {
          "1": "attn-1"
        }
      })
    })

    // act
    state = state
      .placeAttendee("attn-1", "boat-1", "3", "boat-2", "1")
      .commitPlacementChanges()

    // assert
    expect(state.currentRevision.getIn(["boat-1", "3"])).toBe("attn-1")
    expect(state.currentRevision.getIn(["boat-2", "1"])).toBe("attn-2")
  })

  describe("getUncommittedPlacement", () => {
    it("should get committed placement when no uncommitted placement for seat", () => {
      // arrange
      const state = new PlacementsStateRecord({
        committed: fromJS({
          "boat-1": {
            "2":  "attn-1"
          }
        })
      })

      // act
      const attendeeId = state.getPlacement("boat-1", "2")

      // assert
      expect(attendeeId).toBe("attn-1")
    })

    it("should get uncommitted placement for seat", () => {
      // arrange
      const state = new PlacementsStateRecord({
        committed: fromJS({
          "boat-1": {
            "2": "attn-1"
          }
        })
      })

      // act
      const attendeeId = state.getPlacement("boat-1", "2")

      // assert
      expect(attendeeId).toBe("attn-2")
    })
  })

  describe("getPlacedAttendees", () => {
    it("should prioritize uncommitted attendees", () => {
      // arrange
      const state = new PlacementsStateRecord({
        committed: fromJS({
          "boat-1": {
            "1": "attn-1",
            "2": "attn-5"
          },
          "boat-2": {
            "1": "attn-3",
            "3": "attn-4"
          }
        })
      })

      // act
      const attendees = state.getPlacedAttendees()

      // assert
      expect(attendees.count()).toBe(4)
    })
  })
})
