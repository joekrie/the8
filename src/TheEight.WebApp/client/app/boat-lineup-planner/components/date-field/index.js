import { Component } from "react"
import rome from "rome"

import { formatLocalDate, parseLocalDate } from "common/date-utils"

export default class DateField extends Component {
  constructor(props) {
    super(props)

    this.state = {
      rawValue: this.props.value.toString(),
      isValid: true,
      isShowingDatepicker: false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.state = {
      rawValue: nextProps.value.toString(),
      isValid: true
    }

    this.datepicker.setValue(nextProps.value.toString())
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

    this.datepicker = rome(this.input, {
      time: false,
      initialValue: this.props.value.toString()
    });
    
    this.datepicker.on('data', newValue => {
      this.onChange(newValue)
    });
  }

  onToggleDatepicker() {
    this.setState({
      isShowingDatepicker: !this.state.isShowingDatepicker
    })
  }

  render() {
    const { rawValue } = this.state

    const displayParsed = 
      this.state.isValid
        ? <small className="text-muted">{formatLocalDate(this.props.value)}</small>
        : null

    const datepickerStyles = {
      display: this.state.isShowingDatepicker ? "inherit" : "none" 
    }
      
    return (
      <fieldset className="form-group">
        <label htmlFor="date">
          Date
          &nbsp;
          <i className="fa fa-info-circle" ref={ref => this.infoRef = ref} aria-hidden="true"></i>
        </label>
        <div className="input-group">
          <input id="date" className="form-control" value={rawValue.toString()} 
            onChange={evt => this.onChange(evt.target.value)} />
          <span className="input-group-btn">
            <button className="btn btn-secondary" type="button" onClick={() => this.onToggleDatepicker()}>
              <i className="fa fa-calendar" aria-hidden="true"></i>
            </button>
          </span>
        </div>
        <div style={datepickerStyles} ref={ref => this.input = ref}></div>
        {displayParsed}
      </fieldset>
    )
  }
}