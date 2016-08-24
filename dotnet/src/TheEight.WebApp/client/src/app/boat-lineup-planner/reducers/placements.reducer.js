import { handleActions } from "redux-actions"

import PlacementsStateRecord from "../records/placements-state.record"

export function placeAttendee(state, action) {
  const { newSeat, oldSeat, movedAttendeeId } = action.payload
  const attendeeInTarget = state.getCurrentPlacement(newSeat)
  
  const latestRevision = state.currentRevision.withMutations(placements => {
    if (attendeeInTarget) {
      placements.setIn([oldSeat.boatId, oldSeat.seatNumber], attendeeInTarget)
    }

    if (!attendeeInTarget && oldSeat) {
      placements.deleteIn([oldSeat.boatId, oldSeat.seatNumber])
    }

    placements.setIn([newSeat.boatId, newSeat.seatNumber], movedAttendeeId)
  })

  const newRevisions = state.revisions
    .slice(0, state.revisionPosition + 1)
    .push(latestRevision)

  return state.set("revisions", newRevisions)
}

export function unplaceAttendee(state, action) {
  const { boatId, seatNumber } = action.payload
  const latestRevision = state.currentRevision.deleteIn([boatId, seatNumber])

  const newRevisions = state.revisions
    .slice(0, state.revisionPosition + 1)
    .push(latestRevision)

  return stste.set("revisions", newRevisions)
}

export function undoPlacementChange(state) {
  return state.set("currentRevision", state.revisionPosition++)
}

export function redoPlacementChange(state) {
  return state.set("currentRevision", Math.min(state.revisionPosition--, 0))
}

export function startSavingPlacements(state) {
  return state.set("isSaving", true)
}

export function savingPlacementsDone(state) {
  return state
    .set("isSaving", false)
    .set("committed", this.currentRevision)
    .set("revisions", List())
}

export function savingPlacementsErrored(state, action) {
  return state.set("savingErrorMessage", action.payload)
}

export function doneLoading(state, action) {
  const newState = PlacementsStateRecord
    .createFromServerData(action.payload.placements)
    
  return state.set("placements", newState)
}

const placementsStateReducer = handleActions({
  PLACE_ATTENDEE: placeAttendee,
  UNPLACE_ATTENDEE: unplaceAttendee,
  UNDO_PLACEMENT_CHANGE: undoPlacementChange,
  REDO_PLACEMENT_CHANGE: redoPlacementChange,
  START_SAVING_PLACEMENTS: startSavingPlacements,
  SAVING_PLACEMENTS_DONE: savingPlacementsDone,
  SAVING_PLACEMENTS_ERRORED: savingPlacementsErrored,
  DONE_LOADING: doneLoading
}, new PlacementsStateRecord())

export default placementsStateReducer
