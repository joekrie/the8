import { Map, List } from "immutable";

import EventDetailsRecord from "boat-lineup-planner/models/event-details-record";

const defaultState = {
  isInitialDataLoaded: false,
  eventDetails: Map({
    isSaving: false,
    saveUrl: "",
    data: new EventDetailsRecord()
  }),
  boats: Map(),
  attendees: List()
};

export default defaultState
