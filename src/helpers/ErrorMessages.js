(function(insight) {
    /**
     * Error messages used throughout the library
     * @enum {String}
     */
    insight.ErrorMessages = {

        invalidArrayParameterException: 'Expects array parameter.',

        invalidDataSetOrArrayParameterException: 'Expects insight.DataSet or an object Array parameter.',

        invalidFunctionParameterException: 'Expects function parameter.',

        nonNumericalPairsException: 'Expect all values used to be numeric.' +
            'At least one invalid pair of values was found, see the data for the details of all invalid pairs.',

        unequalLengthArraysException: 'Expects both arrays to have equal length.'
    };


})(insight);
