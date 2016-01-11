import React from "react";

class BulkParser extends React.Component {
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
            <div>
                <textarea value={unparsedEmails} onChange={handleEmailsChange}></textarea>
                <br/>
                <button onClick={handleAddEmails}>
                    Add
                </button>
            </div>
        );
    }
}

BulkParser.propTypes = {
    addBulkEmails: React.PropTypes.func
};

export default BulkParser;