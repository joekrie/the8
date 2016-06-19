import { Component } from "react";
import { LocalDate, nativeJs } from "js-joda";
import "sugar";

import { formatLocalDate } from "../../common/date-utils";

export default class DateField extends Component {
  constructor(props) {
    super(props);

    const { value } = props;

    this.state = {
      rawValue: value.toString(),
      isValid: true
    };
  }

  onChange(rawValue) {
    const parsedDate = Date.create(rawValue);
    const isValid = parsedDate.isValid();    
    this.setState({ rawValue, isValid });

    if (isValid) {
      const localDate = LocalDate.from(nativeJs(parsedDate));
      this.props.onChange(localDate);
    }
  }

  componentDidMount() {
    $(this.infoRef).tooltip({
      title: "Hint: Try entering 'today' or 'next Monday'",
      placement: "right"
    });
  }

  render() {
    const { rawValue } = this.state;

    const displayParsed = this.state.isValid
      ? <small className="text-muted">{formatLocalDate(this.props.value)}</small>
      : null;

    return (
      <fieldset className="form-group">
        <label htmlFor="date">
          Date
          &nbsp;
          <i className="fa fa-info-circle" ref={ref => this.infoRef = ref} aria-hidden="true"></i>
        </label>
        <input id="date" className="form-control" color="black" value={rawValue} 
          onChange={evt => this.onChange(evt.target.value)} />
        {displayParsed}
      </fieldset>
    );
  }
}