import { Component } from "react"
import { observable, action } from "mobx"
import { observer } from "mobx-react"

@observer
export default class WaitingAnimation extends Component {
  @observable dots = ""
  
  @action setDots(dots) {
    this.dots = dots
  }

  componentDidMount() {
    const dotCombos = [ "", ".", "..", "..." ]
    let dotComboPos = 0

    const onInterval = () => {
      dotComboPos = dotComboPos >= dotCombos.length - 1 ? 0 : dotComboPos + 1
      this.setDots(dotCombos[dotComboPos])
    }

    onInterval()
    setInterval(onInterval, 800)
  }

  render() {
    return (
      <div>
        {this.props.label}{this.state.dots}
      </div>
    )
  }
}
