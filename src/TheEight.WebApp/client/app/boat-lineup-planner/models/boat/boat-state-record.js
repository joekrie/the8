import { Map } from "immutable"

import BoatStateRecord from "./event-details-record"

const BoatStateRecord = Record({
    boats: Map(),
    isLoaded: false,
    isLoading: false
})

export default BoatStateRecord
