import { Component } from "react";
import "sugar";
import { LocalDate, nativeJs } from "js-joda";

import SeatContainer from "../containers/seat-container";

export default class DateField extends Component {
  constructor(props) {
    super(props);

    const { initialValue } = props;

    this.state = {
      rawValue: initialValue.toString()
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

  render() {
    const { rawValue } = this.state;

    return (
      <div>
        <label>
          Date
          <input color="black" value={rawValue} onChange={evt => this.onChange(evt.target.value)} />
        </label>
      </div>
    );
  }
}