import { Component } from "react"

export default class WaitingAnimation extends Component {
  constructor() {
    super()

    this.state = {
      dots: ''
    }
  }
  
  componentDidMount() {
    const dotCombos = [ '', .', '..', '...' ]
    let dotComboPos = 0

    const onInterval = () => {
      dotComboPos = dotComboPos >= dotCombos.length - 1 
        ? 0 : dotComboPos + 1

      this.setState({
        dots: dotCombos[dotComboPos]
      })
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
