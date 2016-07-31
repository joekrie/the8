export default function setInitialState(prevState, action) {
  return prevState.set("isInitialDataLoaded", true)
}
