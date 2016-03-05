import {PropTypes, Component} from "react";
import Radium from "radium";

class BulkParser extends Component {
    constructor(props) {
        super(props);
        this.state = { unparsedEmails: "" };
    }

    render() {
        const { addBulkEmails } = this.props;
        const { unparsedEmails } = this.state;

        const handleEmailsChange = event => {
            const newVal = event.target.value;
            this.setState({ unparsedEmails: newVal });
        };

        const handleAddEmails = () => {
            addBulkEmails({ emails: unparsedEmails });
            this.setState({ unparsedEmails: "" });
        };

        return (
            <div style={[styles.root]}>
                <textarea style={[styles.textbox]} 
                          value={unparsedEmails} 
                          onChange={handleEmailsChange} />
                <button style={[styles.addButton]} 
                        onClick={handleAddEmails}>
                    Add
                </button>
            </div>
        );
    }
}

const styles = {
    root: {
        
    },
    textbox: {
        "display": "block"
    },
    addButton: {
        "display": "block"
    }
};

BulkParser.propTypes = {
    addBulkEmails: PropTypes.func.isRequired
};

export default Radium(BulkParser);