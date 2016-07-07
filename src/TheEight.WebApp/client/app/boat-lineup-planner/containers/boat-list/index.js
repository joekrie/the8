import { List } from "immutable"
import { Component } from "react"
import { connect } from "react-redux"

import Boat from "boat-lineup-planner/components/boat"

export const mapStateToProps = ({ boats }) => ({ boats: boats.valueSeq() })

@connect(mapStateToProps)
export default class BoatList extends Component {
  render() {
    const { boats } = this.props   

    const boatComponents = boats.map(boat => 
      <Boat key={boat.details.boatId} boat={boat} />
    )

    const styles = {
      "marginTop": "0px",
      "marginBottom": "0px",
      "paddingLeft": "20px",
      "display": "flex",
      "overflowX": "auto",
      "alignItems": "flex-start",
      "height": "100%"
    }

    return (
      <div style={styles}>
        {boatComponents}
      </div>
    )
  }
}

export default BoatList