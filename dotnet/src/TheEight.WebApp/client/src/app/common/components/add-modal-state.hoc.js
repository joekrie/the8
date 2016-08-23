import { compose, withState, mapProps } from "recompose"
import { omit } from "lodash"

function addModalState(modalName) {
  const capitalizedName = capitalize(modalName)
  const statePropName = `is${capitalizedName}ModalOpen`
  const stateSetterPropName = `setIs${capitalizedName}ModalOpen`

  return compose(
    withState(statePropName, stateSetterPropName, false),
    mapProps(props => ({
      `open${capitalizedName}Modal`: props[stateSetterPropName](true),
      `close${capitalizedName}Modal`: props[stateSetterPropName](false),
      omit(props, stateSetterPropName)
    }))
  )
}