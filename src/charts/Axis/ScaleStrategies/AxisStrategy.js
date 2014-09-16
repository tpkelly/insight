(function(insight) {

    /*
     * An axis strategy representing time and date scales.
     */
    insight.AxisStrategy = function AxisStrategy() {

        var self = this;

        self.domain = function(axis) {
            return [0, 0];
        };

        self.initialTickValue = function(axis, tickFrequency) {
            return 0;
        };

        self.calculateTickValues = function(axis, frequency) {
            var domain = axis.domain();

            var tickValue = self.initialTickValue(axis, frequency);

            var results = [];

            while (tickValue <= domain[1] && self.frequencyValue(frequency) > 0) {
                results.push(tickValue);
                tickValue = self.increaseTickStep(axis, tickValue, frequency);
            }

            //Filter out any tickmarks outside the domain range
            results = results.filter(function(d) {
                return (d <= domain[1]) && (d >= domain[0]);
            });

            return results;
        };

        self.tickValues = function(axis) {
            return self.calculateTickValues(axis, axis.tickFrequency());
        };

        function calculateMaxWidth(axis, tickFrequency) {
            var tickValues = self.calculateTickValues(axis, tickFrequency);
            var tickLabelSizes = axis.measureTickValues(tickValues);

            var maxValue;
            if (axis.isHorizontal()) {
                maxValue = d3.max(tickLabelSizes, function(d) {
                    return Math.abs(d.width);
                });
            } else {
                maxValue = d3.max(tickLabelSizes, function(d) {
                    return Math.abs(d.height);
                });
            }
            return maxValue * tickValues.length;
        }

        self.tickFrequencyForDomain = function(axis, domain) {
            var tickFrequency = self.initialTickFrequency(axis, domain);
            var domainRange = domain[1].valueOf() - domain[0].valueOf();

            var step = 0;
            //Iterate until we have a reasonably small number of ticks
            while (Math.floor(domainRange / self.frequencyValue(tickFrequency)) > 10) {
                tickFrequency = self.increaseTickFrequency(axis, tickFrequency, step++);
            }

            var axisSize = axis.isHorizontal() ? axis.bounds[0] : axis.bounds[1];

            if (axisSize === 0) {
                return tickFrequency;
            }

            //Iterate until we have a ticks non longer overlap
            while (calculateMaxWidth(axis, tickFrequency) > axisSize) {
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

        self.increaseTickStep = function(axis, currentTickValue, tickFrequency) {
            return currentTickValue;
        };

        self.decreaseTickStep = function(axis, currentTickValue, tickFrequency) {
            return currentTickValue;
        };
    };

})(insight);
