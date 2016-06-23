import { Component } from "react"

import { formatLocalDate, parseLocalDate } from "common/date-utils"

export default class DateField extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rawValue: this.props.value.toString(),
      isValid: true
    }
  }

  onChange(rawValue) {
    const parsedDate = parseLocalDate(rawValue)
    let isValid = false

    if (parsedDate) {
      isValid = true
      this.props.onChange(parsedDate)
    }
    
    this.setState({ rawValue, isValid })
  }

  componentDidMount() {
    $(this.infoRef).tooltip({
      title: "Hint: Try entering 'today' or 'next Monday'",
      placement: "right"
    })
  }

  render() {
    const { rawValue } = this.state

    const displayParsed = this.state.isValid
      ? <small className="text-muted">{formatLocalDate(this.props.value)}</small>
      : null

    return (
      <fieldset className="form-group">
        <label htmlFor="date">
          Date
          &nbsp;
          <i className="fa fa-info-circle" ref={ref => this.infoRef = ref} aria-hidden="true"></i>
        </label>
        <input id="date" className="form-control" value={rawValue} 
          onChange={evt => this.onChange(evt.target.value)} />
        {displayParsed}
      </fieldset>
    )
  }
}