export default function addBoat(prevState, action) {
  const { 
    type, 
    payload: { boatDetails: { boatId } } 
  } = action

  const newBoats = prevState.boats.set(
    boatId, 
    new BoatRecord({ 
      details: boatDetails 
    })
  )
  
  return {
    ...prevState,
    boats: newBoats
  }
}
