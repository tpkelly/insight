(function(insight) {

    /*
     * An axis strategy representing category scales.
     */
    insight.OrdinalAxis = function OrdinalAxis() {

        var self = this;

        insight.AxisStrategy.call(this);

        self.domain = function(axis) {
            return findOrdinalValues(axis);
        };

        self.tickValues = function(axis) {
            return axis.domain();
        };

        /*
         * Queries all series that use this axis to get the list of available values
         * @returns {object[]} values - the values for this ordinal axis
         */
        function findOrdinalValues(axis) {
            var vals = [];

            // Build a list of values used by this axis by checking all Series using this axis
            // Optionally provide an ordering function to sort the results by.  If the axis is ordered but no custom ordering is defined,
            // then the series value function will be used by default.
            axis.series.forEach(function(series) {
                vals = vals.concat(series.keys(axis.orderingFunction()));
            });

            vals = insight.Utils.arrayUnique(vals);

            return vals;
        }

        self.increaseTickStep = function(axis, currentTickValue) {
            var categories = axis.domain();
            var tickIndex = categories.indexOf(currentTickValue);

            if (tickIndex === -1 || tickIndex === categories.length - 1) {
                return null;
            }

            return categories[tickIndex + 1];
        };

        self.decreaseTickStep = function(axis, currentTickValue) {
            var categories = axis.domain();
            var tickIndex = categories.indexOf(currentTickValue);

            if (tickIndex === -1 || tickIndex === 0) {
                return null;
            }

            return categories[tickIndex - 1];
        };
    };

    insight.OrdinalAxis.prototype = Object.create(insight.AxisStrategy.prototype);
    insight.OrdinalAxis.prototype.constructor = insight.OrdinalAxis;

})(insight);
