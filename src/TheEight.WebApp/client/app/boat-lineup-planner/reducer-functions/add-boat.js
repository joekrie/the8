export default function createBoat(prevState, { type, payload: { boatDetails } }) {
  const boatId = boatDetails.boatId

  const newBoats = prevState.boats.set(boatId, 
    new BoatRecord({ 
      details: boatDetails 
    }))
  
  return {
    ...prevState,
    boats: newBoats
  }
}