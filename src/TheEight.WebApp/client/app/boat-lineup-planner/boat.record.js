import { Record, Map, List } from "immutable";
import { range } from "lodash";

import SeatRecord from "./seat.record";
import BoatInfoRecord from "./boat-info.record";
import PlacementRecord from "./placement.record";

const defaults = {
    boatInfo: BoatInfoRecord(),
    assignedSeats: Map()
};

class BoatRecord extends Record(defaults) {
    isAttendeeInBoat(attendeeId) {
        return this.assignedSeats.contains(attendeeId);
    }

    isSeatAssigned(seatNumber) {
        return this.assignedSeats.has(seatNumber);
    }

    get seats() {
        const { isCoxed, seatCount, boatId } = this.boatInfo;
        const seatNums = range(isCoxed ? 0 : 1, seatCount + 1);

        const seatRecs = seatNums.map(num =>
            new SeatRecord({
                boatId: boatId,
                seatNumber: num
            })
        );
        
        return List(seatRecs);
    }

    get placements() {
        return this.assignedSeats.map((attendeeId, seatNumber) => {
            const { boatId } = this.boatInfo;

            const seat = SeatRecord({
                boatId,
                seatNumber
            });

            return PlacementRecord({
                attendeeId,
                seat
            });
        });
    }
}

export default BoatRecord