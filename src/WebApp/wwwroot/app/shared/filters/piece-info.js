angular.module("shared")
    .filter("pieceInfo", function() {
        return function(pieceInfo) {
            return pieceInfo.magnitude + " " + pieceInfo.unit;
        }
    });