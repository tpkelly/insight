(function(insight) {

    /*
     * An axis strategy representing linear scales.
     */
    insight.LinearAxis = function LinearAxis() {

        var self = this;

        insight.AxisStrategy.call(this);

        self.domain = function(axis) {
            return [0, self.findMax(axis)];
        };

        self.tickValues = function(axis) {
            var frequency = axis.tickFrequency();
            var domain = axis.domain();

            var tickValue = domain[0];

            var results = [];

            while (tickValue <= domain[1] && frequency > 0) {
                results.push(tickValue);
                tickValue += frequency;
            }

            return results;
        };

    };

    insight.LinearAxis.prototype = Object.create(insight.AxisStrategy.prototype);
    insight.LinearAxis.prototype.constructor = insight.LinearAxis;

})(insight);
