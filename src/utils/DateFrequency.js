(function(insight) {

    /**
     * A Frequency used for spacing tick marks on a Date-Time axis.
     * @class insight.DateFrequency
     * @param {Number} year The number of years to represent
     * @param {Number} [months] The number of months to represent
     * @param {Number} [days] The number of days to represent
     * @param {Number} [hours] The number of hours to represent
     * @param {Number} [minutes] The number of minutes to represent
     * @param {Number} [seconds] The number of seconds to represent
     */
    insight.DateFrequency = function DateFrequency(years, months, days, hours, minutes, seconds) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Days are not zero based
        var adjustedDay = days + 1;

        var referenceDate = new Date(
            years,
            months || 0,
            adjustedDay || 1,
            hours || 0,
            minutes || 0,
            seconds || 0);

        // Internal functions -----------------------------------------------------------------------------------------

        self.toSeconds = function() {

            var totalSeconds = referenceDate.getSeconds();
            totalSeconds += referenceDate.getMinutes() * 60;
            totalSeconds += referenceDate.getHours() * 60 * 60;
            totalSeconds += (referenceDate.getDate() - 1) * 60 * 60 * 24;
            totalSeconds += referenceDate.getMonth() * 60 * 60 * 24 * 29.5;
            totalSeconds += (referenceDate.getFullYear() - 1900) * 60 * 60 * 24 * 365.25;

            return totalSeconds;
        };

        self.toValue = function() {
            return referenceDate;
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

        self.roundDate = function(date) {
            var years = date.getFullYear(),
                months = date.getMonth(),
                days = date.getDate(),
                hours = date.getHours(),
                minutes = date.getMinutes(),
                seconds = date.getSeconds();

            if (self.getYears() !== 0) {
                return new Date(years, 0);
            }
            if (self.getMonths() !== 0) {
                return new Date(years, months);
            }
            if (self.getDays() !== 0) {
                return new Date(years, months, days);
            }
            if (self.getHours() !== 0) {
                return new Date(years, months, days, hours);
            }
            if (self.getMinutes() !== 0) {
                return new Date(years, months, days, hours, minutes);
            }
            return date;
        };
    };

    // Public functions --------------------------------------------------------------------------------------

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
     * A DateFrequency representing a number of weeks
     * @param {Number} numberOfWeeks The number of weeks to represent
     * @returns {insight.DateFrequency} - A new DateFrequency representing this number of weeks.
     */
    insight.DateFrequency.dateFrequencyForWeeks = function(numberOfWeeks) {
        return new insight.DateFrequency(0, 0, numberOfWeeks * 7);
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
