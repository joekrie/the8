import { capitalize, snakeCase, mapKeys } from "lodash";

export default input => capitalize(snakeCase(input));