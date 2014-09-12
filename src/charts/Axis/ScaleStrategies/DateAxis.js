(function(insight) {

    /*
     * An axis strategy representing time and date scales.
     */
    insight.DateAxis = function DateAxis() {

        var self = this;

        insight.AxisStrategy.call(this);

        self.domain = function(axis) {
            return [new Date(self.findMin(axis)), new Date(self.findMax(axis))];
        };

    };

    insight.DateAxis.prototype = Object.create(insight.AxisStrategy.prototype);
    insight.DateAxis.prototype.constructor = insight.DateAxis;

})(insight);
