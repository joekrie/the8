import { Map, fromJS } from "immutable"

import BoatsStateRecord from "../boats-state.record"

describe("boat-lineup-planner > records > boats-state-record > BoatsStateRecord", () => {
  it("should modify boat details", () => {
    // arrange
    let state = new BoatsStateRecord({
      boats: fromJS({
        "boat-1": {
          committedDetails: {
            title: "Lucky",
            seatCount: 4,
            isCoxed: true
          }
        }
      })
    })

    const newDetails = fromJS({
      title: "Victory",
      seatCount: 4,
      isCoxed: true
    })

    // act   
    state = state.modifyBoatDetails("boat-1", newDetails)

    // assert
    expect(state.boats.getIn(["boat-1", "uncommittedDetails", "title"])).toBe("Victory")
  })
})
