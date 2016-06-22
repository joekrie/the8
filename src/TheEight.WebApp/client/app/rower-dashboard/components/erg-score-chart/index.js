import { Component } from "react"
import { scaleTime, scaleLinear } from "d3-scale"
import { selectAll } from "d3-selection"
import { line } from "d3-shape"

export default class ErgScoreChart extends Component {
  render() {
   const x = scaleLinear()

   const y = scaleTime()

    return (
      <div>
        
      </div>
    )
  }
}