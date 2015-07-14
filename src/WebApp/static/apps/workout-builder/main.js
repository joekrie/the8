import {Aurelia, Plugins} from "aurelia-framework";

export function configure(aurelia) {
    aurelia.use
        .standardConfiguration();

    aurelia.start().then(a => a.setRoot("apps/workout-builder/root"));
}