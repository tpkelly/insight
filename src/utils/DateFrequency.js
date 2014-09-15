(function(insight) {

    /*
     * A Frequency used for spacing tick marks on a Date-Time axis.
     */
    insight.DateFrequency = function DateFrequency(years, months, days, hours, minutes, seconds) {

        var self = this;

        var referenceDate = new Date(
            years,
            months || 0, (days + 1) || 1,
            hours || 0,
            minutes || 0,
            seconds || 0);

        self._date = referenceDate;

        self.toSeconds = function() {

            var totalSeconds = referenceDate.getSeconds();
            totalSeconds += referenceDate.getMinutes() * 60;
            totalSeconds += referenceDate.getHours() * 60 * 60;
            totalSeconds += referenceDate.getDay() * 60 * 60 * 24;
            totalSeconds += referenceDate.getMonth() * 60 * 60 * 24 * 29.5;
            totalSeconds += referenceDate.getYear() * 60 * 60 * 24 * 365.25;

            return totalSeconds;
        };

        self.getYears = function() {
            return referenceDate.getFullYear() - 1900;
        };

        self.getMonths = function() {
            return referenceDate.getMonth();
        };

        self.getDays = function() {
            return referenceDate.getDate() - 1;
        };

        self.getHours = function() {
            return referenceDate.getHours();
        };

        self.getMinutes = function() {
            return referenceDate.getMinutes();
        };

        self.getSeconds = function() {
            return referenceDate.getSeconds();
        };

    };

    /**
     * A DateFrequency representing a number of years
     * @param {Number} numberOfYears The number of years to represent
     * @returns {insight.DateFrequency} - A new DateFrequency representing this number of years.
     */
    insight.DateFrequency.dateFrequencyForYears = function(numberOfYears) {
        return new insight.DateFrequency(numberOfYears);
    };

    /**
     * A DateFrequency representing a number of months
     * @param {Number} numberOfMonths The number of months to represent
     * @returns {insight.DateFrequency} - A new DateFrequency representing this number of months.
     */
    insight.DateFrequency.dateFrequencyForMonths = function(numberOfMonths) {
        return new insight.DateFrequency(0, numberOfMonths);
    };

    /**
     * A DateFrequency representing a number of days
     * @param {Number} numberOfDays The number of days to represent
     * @returns {insight.DateFrequency} - A new DateFrequency representing this number of days.
     */
    insight.DateFrequency.dateFrequencyForDays = function(numberOfDays) {
        return new insight.DateFrequency(0, 0, numberOfDays);
    };

    /**
     * A DateFrequency representing a number of hours
     * @param {Number} numberOfHours The number of hours to represent
     * @returns {insight.DateFrequency} - A new DateFrequency representing this number of hours.
     */
    insight.DateFrequency.dateFrequencyForHours = function(numberOfHours) {
        return new insight.DateFrequency(0, 0, 0, numberOfHours);
    };

    /**
     * A DateFrequency representing a number of minutes
     * @param {Number} numberOfMinutes The number of minutes to represent
     * @returns {insight.DateFrequency} - A new DateFrequency representing this number of minutes.
     */
    insight.DateFrequency.dateFrequencyForMinutes = function(numberOfMinutes) {
        return new insight.DateFrequency(0, 0, 0, 0, numberOfMinutes);
    };

    /**
     * A DateFrequency representing a number of seconds
     * @param {Number} numberOfSeconds The number of seconds to represent
     * @returns {insight.DateFrequency} - A new DateFrequency representing this number of seconds.
     */
    insight.DateFrequency.dateFrequencyForSeconds = function(numberOfSeconds) {
        return new insight.DateFrequency(0, 0, 0, 0, 0, numberOfSeconds);
    };
})(insight);
