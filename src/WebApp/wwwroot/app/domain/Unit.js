var app;
(function (app) {
    var domain;
    (function (domain) {
        (function (Unit) {
            Unit[Unit["Meters"] = 0] = "Meters";
            Unit[Unit["Minutes"] = 1] = "Minutes";
        })(domain.Unit || (domain.Unit = {}));
        var Unit = domain.Unit;
    })(domain = app.domain || (app.domain = {}));
})(app || (app = {}));
