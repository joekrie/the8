import { upperFirst } from "lodash";

export const formatLocalDate = localDate => {
  const dow = upperFirst(localDate.dayOfWeek());
  const mon = upperFirst(localDate.month().toString());
  const day = localDate.dayOfMonth();
  const year = localDate.year();
  return `${dow}, ${mon} ${day}, ${year}`;
};