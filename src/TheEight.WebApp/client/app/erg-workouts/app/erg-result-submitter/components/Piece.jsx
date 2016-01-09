import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

import dndTypes from '../constants/dndTypes';
import attendeePositions from '../constants/attendeePositions';

const dropSpec = {
    hover: (props, monitor, component) => {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        if (dragIndex === hoverIndex) {
            return;
        }

        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
            return;
        }

        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
            return;
        }

        props.moveCard(dragIndex, hoverIndex);
        monitor.getItem().index = hoverIndex;
    }
};

const dropCollect = (connect, monitor) => ({
    connectDropTarget: connect.dropTarget()
});

const dragSpec = {
    beginDrag: props => {id: props.id, index: props.index}
};

const dragCollect = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
});

@DropTarget(dndTypes.ATTENDEE, dropSpec, dropCollect)
@DragSource(dndTypes.ATTENDEE, dragSpec, dragCollect)
export default class extends React.Component {
    constructor() {
        this.state = {
            value: ''
        };
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    render() {
        return (
            <div>
                <label>
                    {this.props.title}
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
            </div>
        );
    }
}