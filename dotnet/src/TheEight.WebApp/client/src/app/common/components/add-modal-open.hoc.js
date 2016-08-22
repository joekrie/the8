import { withState } from "recompose"
import { capitalize } from "lodash"

function addModalState(modalName) {
  const capitalizedName = capitalize(modalName)
  return withState(`is${capitalizedName}ModalOpen`, `setIs${capitalizedName}ModalOpen`, false)
}

export default addModalState
