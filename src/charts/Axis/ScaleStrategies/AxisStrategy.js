(function(insight) {

    /*
     * An axis strategy representing time and date scales.
     */
    insight.AxisStrategy = function AxisStrategy() {

        var self = this;

        self.domain = function(axis) {
            return [0, 0];
        };

        self.initialTickValue = function(axis) {
            return 0;
        };

        self.tickValues = function(axis) {
            var frequency = axis.tickFrequency();
            var domain = axis.domain();

            var tickValue = self.initialTickValue(axis);

            var results = [];

            while (tickValue <= domain[1] && self.frequencyValue(frequency) > 0) {
                results.push(tickValue);
                tickValue = self.increaseTickStep(axis, tickValue);
            }

            //Filter out any tickmarks outside the domain range
            results = results.filter(function(d) {
                return (d <= domain[1]) && (d >= domain[0]);
            });

            return results;
        };

        self.tickFrequencyForDomain = function(axis, domain) {
            var tickFrequency = self.initialTickFrequency(axis, domain);
            var domainRange = domain[1].valueOf() - domain[0].valueOf();

            var step = 0;
            //Iterate until we have a reasonably small number of ticks
            while (Math.floor(domainRange / self.frequencyValue(tickFrequency)) > 10) {
                tickFrequency = self.increaseTickFrequency(axis, tickFrequency, step++);
            }

            return tickFrequency;
        };

        self.frequencyValue = function(frequency) {
            return frequency;
        };

        self.initialTickFrequency = function(axis, domain) {
            return 1;
        };

        self.increaseTickFrequency = function(axis, tickFrequency, step) {
            return tickFrequency + 1;
        };

        self.decreaseTickFrequency = function(axis, tickFrequency, step) {
            return tickFrequency - 1;
        };

        self.tickFrequency = function(axis) {
            return self.tickFrequencyForDomain(axis, axis.domain());
        };

        /*
         * Calculates the minimum value to be used in this axis.
         * @returns {object} - The smallest value in the datasets that use this axis
         */
        self.findMin = function(axis) {
            var min = Number.MAX_VALUE;

            axis.series.forEach(function(series) {
                var m = series.findMin(axis);

                min = m < min ? m : min;
            });

            return min;
        };

        /*
         * Calculates the maximum value to be used in this axis.
         * @returns {object} - The largest value in the datasets that use this axis
         */
        self.findMax = function(axis) {
            var max = 0;

            axis.series.forEach(function(series) {
                var m = series.findMax(axis);

                max = m > max ? m : max;
            });

            return max;
        };

        self.increaseTickStep = function(axis, currentTickValue) {
            return currentTickValue;
        };

        self.decreaseTickStep = function(axis, currentTickValue) {
            return currentTickValue;
        };
    };

})(insight);
