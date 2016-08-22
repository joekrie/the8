import { Component } from "react"
import rome from "rome"

import { formatLocalDate, parseLocalDate } from "app/common/utils/date-utils"

export default class DateField extends Component {
  componentWillReceiveProps(nextProps) {
    this.setState({
      rawValue: nextProps.value.toString()
    })

    this.datepicker.setValue(nextProps.value.toString())
  }

  componentDidMount() {
    $(this.infoRef).tooltip({
      title: "Hint: Try entering 'today' or 'next Monday'",
      placement: "right"
    })

    this.datepicker = rome(this.input, {
      time: false,
      initialValue: this.props.value.toString()
    })
    
    this.datepicker.on("data", newValue => {
      this.props.onChange(newValue)
    })
  }

  render() {
    const { value, onChange } = this.props

    return (
      <fieldset className="form-group">
        <label htmlFor="event-details-date">
          Date
          &nbsp;
          <i className="fa fa-info-circle" ref={ref => this.infoRef = ref} aria-hidden="true"></i>
        </label>          
        <input id="event-details-date" className="form-control" value={value} 
          onChange={evt => onChange(evt.target.value)} />
        <div ref={ref => this.input = ref}></div>
      </fieldset>
    )
  }
}
