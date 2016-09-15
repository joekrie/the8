import { Component } from "react"

export default class LoadingAnimation extends Component {
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
    const { label } = this.props
    const { dots } = this.state

    return (
      <div>
        {label}{this.state.dots}
      </div>
    )
  }
}
