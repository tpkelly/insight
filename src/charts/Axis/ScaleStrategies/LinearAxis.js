(function(insight) {

    /*
     * An axis strategy representing linear scales.
     */
    insight.LinearAxis = function LinearAxis() {

        insight.AxisStrategy.call(this);

        // Private variables ------------------------------------------------------------------------------------------
        var self = this;

        // Internal functions -----------------------------------------------------------------------------------------

        self.domain = function(axis) {
            var scaleMax = self.findMax(axis);

            if (scaleMax === 0) {
                return axis.scale.domain();
            }

            return [0, scaleMax];
        };

        self.initialTickValue = function(axis, tickFrequency) {
            var domain = axis.domain();

            var initialValue = domain[0];
            return Math.ceil(initialValue / tickFrequency) * tickFrequency;
        };

        self.nextTickValue = function(axis, currentTickValue, tickFrequency) {
            var result = currentTickValue + tickFrequency;

            // Round number to a precision of 10 decimal places i.e. 0.300000000004 to 0.3
            return parseFloat(result.toPrecision(10));
        };

        self.previousTickValue = function(axis, currentTickValue, tickFrequency) {
            var result = currentTickValue - tickFrequency;

            // Round number to a precision of 10 decimal places i.e. 0.300000000004 to 0.3
            return parseFloat(result.toPrecision(10));
        };

        self.initialTickFrequency = function(axis, domain) {
            var domainRange = domain[1] - domain[0];

            if (domainRange === 0) {
                return 1;
            }

            return Math.pow(10, Math.floor(Math.log(domainRange) / Math.LN10) - 1);
        };

        self.increaseTickFrequency = function(axis, tickFrequency, step) {
            // Multiply by: 2x, 2.5x (5x cumulative), 2x (10x cumulative), and loop.
            if (step % 3 === 1) {
                return tickFrequency * 2.5;
            }

            return tickFrequency * 2;
        };

        self.decreaseTickFrequency = function(axis, tickFrequency, step) {
            // Divide by: 2x, 2.5x (5x cumulative), 2x (10x cumulative), and loop.
            if (step % 3 === 1) {
                return tickFrequency / 2.5;
            }

            return tickFrequency / 2;
        };

    };

    insight.LinearAxis.prototype = Object.create(insight.AxisStrategy.prototype);
    insight.LinearAxis.prototype.constructor = insight.LinearAxis;

})(insight);
