import { capitalize } from "lodash";

export const formatLocalDate = localDate => {
  const dow = capitalize(localDate.dayOfWeek());
  const mon = capitalize(localDate.month().toString());
  const day = localDate.dayOfMonth();
  const year = localDate.year();
  return `${dow}, ${mon} ${day}, ${year}`;
};