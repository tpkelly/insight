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

        self.tickFrequency = function(axis) {
            var domain = axis.domain();

            var startDate = domain[0];
            var endDate = domain[1];

            var startDateInSeconds = Date.parse(startDate.toString()) / 1000;
            var endDateInSeconds = Date.parse(endDate.toString()) / 1000;

            var tickFrequencySeconds = self.tickFrequencyForDomain([startDateInSeconds, endDateInSeconds]);

            return insight.DateFrequency.dateFrequencyForSeconds(tickFrequencySeconds);
        };

        self.increaseTickStep = function(axis, currentTickValue) {
            var dateFrequency = axis.tickFrequency();
            var newDate = new Date(currentTickValue);

            newDate.setYear(newDate.getFullYear() + dateFrequency.getYears());
            newDate.setMonth(newDate.getMonth() + dateFrequency.getMonths());
            newDate.setDate(newDate.getDate() + dateFrequency.getDays());
            newDate.setHours(newDate.getHours() + dateFrequency.getHours());
            newDate.setMinutes(newDate.getMinutes() + dateFrequency.getMinutes());
            newDate.setSeconds(newDate.getSeconds() + dateFrequency.getSeconds());

            //Deal with changes due to British Summer Time
            var timeZoneOffset = currentTickValue.getTimezoneOffset() - newDate.getTimezoneOffset();
            if (timeZoneOffset !== 0) {
                newDate.setMinutes(newDate.getMinutes() + timeZoneOffset);
            }

            return newDate;
        };

        self.decreaseTickStep = function(axis, currentTickValue) {
            var dateFrequency = axis.tickFrequency();
            var newDate = new Date(currentTickValue);

            newDate.setYear(newDate.getFullYear() - dateFrequency.getYears());
            newDate.setMonth(newDate.getMonth() - dateFrequency.getMonths());
            newDate.setDate(newDate.getDate() - dateFrequency.getDays());
            newDate.setHours(newDate.getHours() - dateFrequency.getHours());
            newDate.setMinutes(newDate.getMinutes() - dateFrequency.getMinutes());
            newDate.setSeconds(newDate.getSeconds() - dateFrequency.getSeconds());

            //Deal with changes due to British Summer Time
            var timeZoneOffset = currentTickValue.getTimezoneOffset() - newDate.getTimezoneOffset();
            if (timeZoneOffset !== 0) {
                newDate.setMinutes(newDate.getMinutes() + timeZoneOffset);
            }

            return newDate;
        };

    };

    insight.DateAxis.prototype = Object.create(insight.AxisStrategy.prototype);
    insight.DateAxis.prototype.constructor = insight.DateAxis;

})(insight);
