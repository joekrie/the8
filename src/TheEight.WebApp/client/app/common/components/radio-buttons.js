import { Component } from "react";

export default class RadioButtons extends Component {
  render() {
    const { groupName, setValue, buttons } = this.props;
    
    const radioButtons = buttons.map(btn => {
      const { label, value,  } = btn;
      return <RadioButton groupName={groupName} value
    });
          
    return (      
      <div>
        
      </div>
    );
  }
}

export default class RadioButton extends Component {
  render() {
    const { label, groupName, value, isChecked, setValue } = this.props;
    const 
    
    return (
      <label>
        <input name={groupName} type="radio" checked={isChecked} 
          onChange={() => setValue(value)} />
        {label}
      </label>
    );
  }
}