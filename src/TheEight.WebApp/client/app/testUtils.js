import TestBackend from "react-dnd-test-backend";
import { DragDropContext } from "react-dnd";
import { mount } from "enzyme";

export const shouldMountWithoutError = (Component, props, expect, needsDndContext = true) => {
    const TestComponent = needsDndContext 
        ? DragDropContext(TestBackend)(Component)
        : Component;

    expect(() => mount(<TestComponent {...props} />));
};