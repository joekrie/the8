angular.module("shared")
    .filter("split", function() {
        return function(duration) {
            if (duration) {
                return formatSplit(duration);
            }

            return "";
        };
    });