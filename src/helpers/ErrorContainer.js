(function(insight) {

    /**
     * The ErrorContainer class is used to capture errors in operations within InsightJs.
     * @class insight.ErrorContainer
     */
    insight.ErrorContainer = function ErrorContainer() {

        var self = this;

        this.message = null;
        this.data = null;
        this.state = 'success';

        this.setError = function(message, data) {

            self.message = message;
            self.data = data === undefined ? null : data;
            self.state = insight.ErrorContainer.State.error;

        };

        this.setWarning = function(message, data) {

            if (self.state === insight.ErrorContainer.State.error) {
                return;
            }

            self.message = message;
            self.data = data === undefined ? null : data;
            self.state = insight.ErrorContainer.State.warning;

        };

    };

    insight.ErrorContainer.State = {

        error: 'error',
        success: 'success',
        warning: 'warning'

    }

})(insight);
