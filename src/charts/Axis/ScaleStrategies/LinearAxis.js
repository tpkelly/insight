(function(insight) {

    /*
     * An axis strategy representing linear scales.
     */
    insight.LinearAxis = function LinearAxis() {

        var self = this;

        insight.AxisStrategy.call(this);

        self.domain = function(axis) {
            var scaleDomain = axis.scale.domain();

            //If available (i.e. not just [0, 1]), use the smarter domain provided by d3 (responds to zoom/panning, etc.)
            if (scaleDomain[0] !== 0 && scaleDomain[1] !== 1) {
                return axis.scale.domain();
            }

            //Fall back to our own calculations
            return [0, self.findMax(axis)];
        };

        self.initialTickValue = function(axis) {
            var domain = axis.domain();
            var tickFrequency = axis.tickFrequency();

            var initialValue = domain[0];
            return Math.ceil(initialValue / tickFrequency) * tickFrequency;
        };

        self.increaseTickStep = function(axis, currentTickValue) {
            return currentTickValue + axis.tickFrequency();
        };

        self.decreaseTickStep = function(axis, currentTickValue) {
            return currentTickValue - axis.tickFrequency();
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
