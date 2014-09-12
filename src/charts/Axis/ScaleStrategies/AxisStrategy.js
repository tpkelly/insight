(function(insight) {

    /*
     * An axis strategy representing time and date scales.
     */
    insight.AxisStrategy = function AxisStrategy() {

        var self = this;

        self.domain = function(axis) {
            return [0, 0];
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

    };

})(insight);
