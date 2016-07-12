export const collect = monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
});

export const getDragItemStyles = currentOffset => 
{
  if (!currentOffset) {
    return {
      "display": "none"
    }
  }

  const { x, y } = currentOffset
  const transform = `translate(${x}px, ${y}px)`

  return {
    "transform": transform,
    "WebkitTransform": transform
  }
}
