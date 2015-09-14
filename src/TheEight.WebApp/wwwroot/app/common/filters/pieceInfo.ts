angular.module("the8.common")
    .filter("pieceInfo", () => pieceInfo => pieceInfo.magnitude + " " + pieceInfo.unit);