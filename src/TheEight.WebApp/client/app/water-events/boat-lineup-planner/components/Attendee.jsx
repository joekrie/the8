import classNames from "classnames";

export default function(props) {
    const { attendee } = props;
    const isCoxswain = attendee.get("position") === "COXSWAIN";
    const displayName = attendee.get("displayName");

    const classes = classNames(
        "attendee",
        isCoxswain ? "coxswain" : "rower"
    );

    return (
        <div className={classes}>
		    {displayName}
	    </div>
    );
}