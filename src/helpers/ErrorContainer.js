(function(insight) {

    /**
     * The ErrorContainer class is used to capture errors in operations within InsightJs.
     * An instance of the ErrorContainer class must only be passed to one function.
     * @class insight.ErrorContainer
     */
    insight.ErrorContainer = function ErrorContainer() {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            data = null,
            message = null,
            state = insight.ErrorContainer.State.success;

        // Internal functions -----------------------------------------------------------------------------------------

        /*
         * Records an error message with optional data.
         * @memberof! insight.ErrorContainer
         * @instance
         * @param {String} errorMessage
         * @param {Object} [errorData]
         */
        self.setError = function(errorMessage, errorData) {

            message = errorMessage;
            data = errorData === undefined ? null : errorData;
            state = insight.ErrorContainer.State.error;

        };

        /*
         * Records a warning message with optional data.
         * @memberof! insight.ErrorContainer
         * @instance
         * @param {String} errorMessage
         * @param {Object} [errorData]
         */
        self.setWarning = function(warningMessage, warningData) {

            if (state === insight.ErrorContainer.State.error) {
                return;
            }

            message = warningMessage;
            data = warningData === undefined ? null : warningData;
            state = insight.ErrorContainer.State.warning;

        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * The data associated with the error or warning.
         * @memberof! insight.ErrorContainer
         * @instance
         * @returns {Object} - The data associated with the error or warning.
         */
        self.data = function() {
            return data;
        };

        /**
         * The descriptive message associated with the error or warning.
         * @memberof! insight.ErrorContainer
         * @instance
         * @returns {String} - The descriptive message associated with the error or warning.
         */
        self.message = function() {
            return message;
        };

        /**
         * The state of the ErrorContainer.
         * @memberof! insight.ErrorContainer
         * @instance
         * @returns {String} - The state of the ErrorContainer.
         * This will be one of the values of <code>insight.ErrorContainer.State</code>.
         */
        self.state = function() {
            return state;
        };

    };

    /**
     * The ErrorContainer State object (enum) is used describe the state of an error container.
     * @enum {String}
     */
    insight.ErrorContainer.State = {
        /** Indicates an error has taken place, any subsequent warnings are ignored by the ErrorContainer */
        error: 'error',
        /** The initial state of an ErrorContainer.  Used to indicate that an operation was successful - no warnings or errors set */
        success: 'success',
        /** Indicates an warning has taken place, any subsequent errors will over-write the warning in the ErrorContainer */
        warning: 'warning'

    };

})(insight);
