(function(insight) {

    /*
     * An axis strategy representing category scales.
     */
    insight.OrdinalAxis = function OrdinalAxis() {

        insight.AxisStrategy.call(this);

        // Private variables ------------------------------------------------------------------------------------------
        var self = this;

        // Private functions -----------------------------------------------------------------------------------------

        /*
         * Queries all series that use this axis to get the list of available values
         * @returns {Object[]} values - the values for this ordinal axis
         */
        function findOrdinalValues(axis) {
            var vals = [];

            // Build a list of values used by this axis by checking all Series using this axis
            // Optionally provide an ordering function to sort the results by.  If the axis is ordered but no custom ordering is defined,
            // then the series value function will be used by default.
            axis.series.forEach(function(series) {
                vals = vals.concat(series.keys(axis.orderingFunction()));
            });

            vals = insight.utils.arrayUnique(vals);

            return vals;
        }

        // Internal functions -----------------------------------------------------------------------------------------

        self.domain = function(axis) {
            return self.axisRange(axis, axis.rangeMinimum(), axis.rangeMaximum());
        };

        self.axisRange = function(axis, minimum, maximum) {
            var domain = findOrdinalValues(axis);
            var minIndex = domain.indexOf(minimum);
            var maxIndex = domain.indexOf(maximum);

            if (minIndex === -1 || maxIndex === -1) {
                return domain;
            }

            //Swap the indices to ensure minIndex < maxIndex
            if (minIndex > maxIndex) {
                var temp = minIndex;
                minIndex = maxIndex;
                maxIndex = temp;
            }

            var rangeValues = domain.slice(minIndex, 1 + maxIndex);

            return rangeValues;
        };

        //Default ordinal domain is []
        self.defaultDomain = d3.functor([]);

        self.tickValues = function(axis) {
            return axis.domain();
        };

        self.initialTickValue = function(axis, tickFrequency) {
            return axis.domain()[0];
        };

        self.nextTickValue = function(axis, currentTickValue, tickFrequency) {
            var categories = axis.domain();
            var tickIndex = categories.indexOf(currentTickValue);

            if (tickIndex === -1 || tickIndex === categories.length - 1) {
                return null;
            }

            return categories[tickIndex + 1];
        };

        self.previousTickValue = function(axis, currentTickValue, tickFrequency) {
            var categories = axis.domain();
            var tickIndex = categories.indexOf(currentTickValue);

            if (tickIndex === -1 || tickIndex === 0) {
                return null;
            }

            return categories[tickIndex - 1];
        };


        /*
         * Calculates the minimum value to be used in this axis.
         * @returns {Object} - The smallest value in the datasets that use this axis
         */
        self.findMin = function(axis) {
            var values = findOrdinalValues(axis);
            return (values.length > 0) ? values[0] : undefined;
        };

        /*
         * Calculates the maximum value to be used in this axis.
         * @returns {Object} - The largest value in the datasets that use this axis
         */
        self.findMax = function(axis) {
            var values = findOrdinalValues(axis);
            return (values.length > 0) ? values[values.length - 1] : undefined;
        };
    };

    insight.OrdinalAxis.prototype = Object.create(insight.AxisStrategy.prototype);
    insight.OrdinalAxis.prototype.constructor = insight.OrdinalAxis;

})(insight);
