import { mapStateToProps } from "../BoatListContainer";
import BoatRecord from "../../records/BoatRecord";
import WaterEventRecord from "../../records/WaterEventRecord";
import { Map, List } from "immutable";
import { isArray } from "lodash";

describe("BoatListContainer", () => {
    it("maps state to props", () => {
        const state = {
            eventSettings: new WaterEventRecord(),
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

        const props = mapStateToProps(state);

        expect(props.boats.count()).toBe(1);
        expect(isArray(props.boats.toJS())).toBe(true);
    });
});