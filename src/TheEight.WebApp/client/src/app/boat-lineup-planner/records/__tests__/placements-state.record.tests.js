import { Map, fromJS } from "immutable"

import PlacementsStateRecord, { Placer, Unplacer, commitPlacementChanges } from "../placements-state.record"

describe("boat-lineup-planner > records > placements-state-record >", () => {
  describe("PlacementsStateRecord", () => {
    it("should commit changes after placing attendee in an empty seat", () => {
      // arrange
      let state = new PlacementsStateRecord()

      // act
      state = state
        .placeAttendee("attn-1", "boat-1", "2")
        .commitPlacementChanges()

      // assert
      expect(state.placements.getIn(["boat-1", "2", "uncommitted"])).toBe("attn-1")
    })

    it("should commit changes after swapping attendees", () => {
      // arrange
      let state = new PlacementsStateRecord({
        placements: fromJS({
          "boat-1": {
            "3": { 
              committed: "attn-2"
            }
          },
          "boat-2": {
            "1": {
              committed: "attn-1"
            }
          }
        })
      })

      // act
      state = state
        .placeAttendee("attn-1", "boat-1", "3", "boat-2", "1")
        .commitPlacementChanges()

      // assert
      expect(state.placements.getIn(["boat-1", "3", "uncommitted"])).toBe("attn-1")
      expect(state.placements.getIn(["boat-2", "1", "uncommitted"])).toBe("attn-2")
    })

    describe("getUncommittedPlacement", () => {
      it("should get committed placement when no uncommitted placement for seat", () => {
        // arrange
        const state = new PlacementsStateRecord({
          placements: fromJS({
            "boat-1": {
              "2": {
                committed: "attn-1"
              }
            }
          })
        })

        // act
        const attendeeId = state.getUncommittedPlacement("boat-1", "2")

        // assert
        expect(attendeeId).toBe("attn-1")
      })

      it("should get uncommitted placement for seat", () => {
        // arrange
        const state = new PlacementsStateRecord({
          placements: fromJS({
            "boat-1": {
              "2": {
                committed: "attn-1",
                uncommitted: "attn-2"
              }
            }
          })
        })

        // act
        const attendeeId = state.getUncommittedPlacement("boat-1", "2")

        // assert
        expect(attendeeId).toBe("attn-2")
      })
    })
  })
})
