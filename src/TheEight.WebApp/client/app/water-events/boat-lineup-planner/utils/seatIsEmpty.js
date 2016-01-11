export function seatIsEmpty(seat) {
    return !Boolean(seat.get("attendee"));
}