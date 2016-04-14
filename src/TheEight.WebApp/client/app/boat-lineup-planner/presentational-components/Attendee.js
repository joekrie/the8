import Radium from "radium";

const Attendee = ({ attendee }) => {
    const rootStyles = [styles.root.base];
    rootStyles.push(attendee.isCoxswain ? styles.root.coxswain : styles.root.rower);

    return (
        <div style={rootStyles}>
		    {attendee.displayName}
	    </div>
    );
};

const styles = {
    root: {
        base: {
            "marginBottom": "10px",
            "padding": "10px",
            "color": "#F5F5F5",
            "cursor": "grab"
        },
        rower: {
            "backgroundColor": "#304F66"
        },
        coxswain: {
            "backgroundColor": "#2A4458"
        }
    }
};

export default Radium(Attendee);