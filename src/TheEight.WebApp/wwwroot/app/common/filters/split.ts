angular.module("the8.common")
    .filter("split", () => duration => {
        if (duration) {
            return formatSplit(duration);
        }

        return "";
    });