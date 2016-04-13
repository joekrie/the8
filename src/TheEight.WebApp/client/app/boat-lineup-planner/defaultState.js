import { Map, List } from "immutable";
import WaterEventRecord from "./records/WaterEventRecord";

export default {
    eventSettings: new WaterEventRecord(),
    boats: Map(),
    attendees: List()
};