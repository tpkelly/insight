(function(insight) {
    /**
     * DataProvider is the base container for data to be used within InsightJS. It provides a consistent approach to
     * sorting and filtering object arrays.
     * @constructor
     * @param {Object[]} collection - The data to be processed and represented by this DataProvider.
     */
    insight.DataProvider = function DataProvider(collection) {

        // Private variables
        var self = this,
            orderFunction = null,
            filterFunction = null;

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * Returns an object array used as the starting point before sorting and filtering is applied.
         * @virtual
         * @memberof! insight.DataProvider
         * @instance
         * @returns {Object[]}
         * */
        self.rawData = function() {
            return collection.slice(0);
        };

        /**
         * @memberof! insight.DataProvider
         * @instance
         * @param {Function} [orderFunc] If provided then the data will be ordered using this function.
         * @param {Integer} [top] If provided then the number of objects returned will be limited to the top N.
         * @returns {Object[]} - An object array containing the data for this DataProvider.
         */
        self.extractData = function(orderFunc, top) {

            // Javascript less-than-or-equal does Number type coercion so treats null as 0
            if (top != null && top <= 0) {
                return [];
            }

            var dataArray = self.rawData();

            orderFunc = orderFunc || self.orderingFunction();

            if (self.filterFunction()) {
                dataArray = dataArray.filter(self.filterFunction());
            }

            if (orderFunc) {
                dataArray = dataArray.sort(orderFunc);
            }

            if (top) {
                dataArray = dataArray.slice(0, top);
            }

            return dataArray;
        };

        /**
         * Gets the function used to order the data source values
         * @memberof! insight.DataProvider
         * @instance
         * @returns {Function} - The current ordering function
         *
         * @also
         *
         * Sets the function used to order the data source values
         * @memberof! insight.DataProvider
         * @instance
         * @param {Function} orderFunc The ordering function
         * @returns {this}
         */
        self.orderingFunction = function(orderFunc) {

            if (!arguments.length) {
                return orderFunction;
            }

            orderFunction = orderFunc;

            return self;
        };

        /**
         * The function to use to filter an object from the data source.
         * The function should return a boolean where false means the object is not included in the data source.
         * @memberof! insight.DataProvider
         * @instance
         * @returns {Function} - The function to use to filter an object from the data source.
         *
         * @also
         *
         * Sets the function to use to filter an object from the data source.
         * The function should return a boolean where false means the object is not included in the data source.
         * @memberof! insight.DataProvider
         * @instance
         * @param {Function} filterFunc The new function to use to filter an object from the data source.
         * @returns {this}
         */
        self.filterFunction = function(filterFunc) {

            if (!arguments.length) {
                return filterFunction;
            }

            filterFunction = filterFunc;

            return self;
        };

    };

})(insight);
