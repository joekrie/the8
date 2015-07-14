import {bindable} from "aurelia-framework";

export class SayHelloCustomElement {
    @bindable to;

    speak() {
        alert(`Hello ${this.to}!`);
    }
}