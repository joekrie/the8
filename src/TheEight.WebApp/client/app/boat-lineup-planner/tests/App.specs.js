import App from "../App";
import { mount } from "enzyme";

describe("Boat lineup planner app", () => {
    it("mounts without error", () => {
        expect(() => mount(<App />)).not.toThrow();
    });
});