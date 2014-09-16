(function(insight) {

    /*
     * An axis strategy representing time and date scales.
     */
    insight.DateAxis = function DateAxis() {

        var self = this;

        var possibleAutoFrequencies = [
            insight.DateFrequency.dateFrequencyForSeconds(1),
            insight.DateFrequency.dateFrequencyForSeconds(5),
            insight.DateFrequency.dateFrequencyForSeconds(15),
            insight.DateFrequency.dateFrequencyForSeconds(30),
            insight.DateFrequency.dateFrequencyForMinutes(1),
            insight.DateFrequency.dateFrequencyForMinutes(5),
            insight.DateFrequency.dateFrequencyForMinutes(15),
            insight.DateFrequency.dateFrequencyForMinutes(30),
            insight.DateFrequency.dateFrequencyForHours(1),
            insight.DateFrequency.dateFrequencyForHours(6),
            insight.DateFrequency.dateFrequencyForHours(12),
            insight.DateFrequency.dateFrequencyForDays(1),
            insight.DateFrequency.dateFrequencyForDays(2),
            insight.DateFrequency.dateFrequencyForWeeks(1),
            insight.DateFrequency.dateFrequencyForMonths(1),
            insight.DateFrequency.dateFrequencyForMonths(3),
            insight.DateFrequency.dateFrequencyForMonths(6),
            insight.DateFrequency.dateFrequencyForYears(1),
            insight.DateFrequency.dateFrequencyForYears(5),
            insight.DateFrequency.dateFrequencyForYears(10),
            insight.DateFrequency.dateFrequencyForYears(100)
        ];

        insight.AxisStrategy.call(this);

        self.domain = function(axis) {
            var scaleDomain = axis.scale.domain();

            //If available (i.e. not just Jan 1st 1970), use the smarter domain provided by d3 (responds to zoom/panning, etc.)
            if (scaleDomain[0].valueOf() !== 0 && scaleDomain[1].valueOf() !== 0) {
                return axis.scale.domain();
            }

            //Fall back to our own date calculations
            return [new Date(self.findMin(axis)), new Date(self.findMax(axis))];
        };

        self.tickFrequency = function(axis) {
            var domain = axis.domain();

            var startDate = domain[0];
            var endDate = domain[1];

            var startDateInSeconds = Date.parse(startDate.toString()) / 1000;
            var endDateInSeconds = Date.parse(endDate.toString()) / 1000;

            var tickFrequency = self.tickFrequencyForDomain(axis, [startDateInSeconds, endDateInSeconds]);

            return tickFrequency;
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

        self.initialTickValue = function(axis) {
            var firstValue = axis.domain()[0];
            var tickFrequency = axis.tickFrequency();
            return tickFrequency.roundDate(firstValue);
        };

        self.frequencyValue = function(frequency) {
            return frequency.toSeconds();
        };

        self.initialTickFrequency = function(axis, domain) {
            return insight.DateFrequency.dateFrequencyForSeconds(1);
        };

        self.increaseTickFrequency = function(axis, currentFrequency, step) {
            return possibleAutoFrequencies[step];
        };

        self.decreaseTickFrequency = function(axis, currentFrequency, step) {
            return possibleAutoFrequencies[possibleAutoFrequencies.length - step - 1];
        };

    };

    insight.DateAxis.prototype = Object.create(insight.AxisStrategy.prototype);
    insight.DateAxis.prototype.constructor = insight.DateAxis;

})(insight);
