import {autoinject, customAttribute} from "aurelia-framework";

export class WorkoutBuilder {
    title = "6 x 500m";
    comments = "Race pace, no cap on stroke rate";
    date: Date = new Date("2015-05-01");

    pieces: ErgPiece[] = [
        new ErgPiece(500, "meters"),
        new ErgPiece(500, "meters"),
        new ErgPiece(500, "meters"),
        new ErgPiece(500, "meters"),
        new ErgPiece(500, "meters"),
        new ErgPiece(500, "meters")
    ];

    pieceUnits: string[] = [
        "meters",
        "minutes"
    ];
}

export class ErgPiece {
    constructor(public magnitude: number,
        public unit: string) { }
}

@customAttribute("mine", null)
export class MyCustomAttr {
    constructor(private element: Element) { }

    valueChanged(newValue) {
        this.element.nodeValue = newValue;
    }
}