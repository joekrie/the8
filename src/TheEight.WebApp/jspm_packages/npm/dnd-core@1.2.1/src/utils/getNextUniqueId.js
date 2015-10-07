/* */ 
"format cjs";
let nextUniqueId = 0;

export default function getNextUniqueId() {
  return nextUniqueId++;
}