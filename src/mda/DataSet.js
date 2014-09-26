(function(insight) {
    /**
     * A DataSet is wrapper around a simple object array, but providing some functions that are required by charts to load and filter data.
     * A DataSet should be used with an array of data that is to be charted without being used in a crossfilter or dimensional dataset.
     * @class insight.DataSet
     * @constructor
     * @param {Object[]} data - The data to be processed and represented by this DataSet.
     */
    insight.DataSet = function DataSet(data) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -----------------------------------------------------------------------------------------

        self.data = data;
        self.crossfilterData = null;

        // Private functions ------------------------------------------------------------------------------------------

        function orderFunction(a, b) {
            return b.value - a.value;
        }

        function filterFunction(d) {
            return true;
        }

        // Public functions -------------------------------------------------------------------------------------------

        self.initialize = function() {

        };

        /**
         * The function to use to filter an object from the dataset.
         * The function should return a boolean where false means the object is not included in the dataset.
         * @memberof! insight.DataSet
         * @instance
         * @returns {Function} - The function to use to filter an object from the dataset.
         *
         * @also
         *
         * Sets the function to use to filter an object from the dataset.
         * The function should return a boolean where false means the object is not included in the dataset.
         * @memberof! insight.DataSet
         * @instance
         * @param {Function} filterFunc The new function to use to filter an object from the dataset.
         * @returns {this}
         */
        self.filterFunction = function(filterFunc) {

            if (!arguments.length) {
                return filterFunction;
            }

            filterFunction = filterFunc;

            return self;
        };

        /** Fetch all the data currently held in this dataset, filtered by the `filterFunction`.
         * @memberof! insight.DataSet
         * @instance
         * @param {Function} [orderFunc] If provided then the data will be returned ordered using this function.
         * @returns {Object[]} data All data currently held by the dataset.
         */
        self.getData = function(orderFunc) {

            var data;

            if (self.data.all) {
                data = self.data.all();
            } else {
                //not a crossfilter set
                data = self.data;
            }

            if (orderFunc) {
                data = data.sort(orderFunc);
            }

            data = data.filter(filterFunction);

            return data;
        };

        /**
         * Gets the function used to order the dataset values
         * @memberof! insight.DataSet
         * @instance
         * @returns {Function} - The current ordering function
         *
         * @also
         *
         * Sets the function used to order the dataset values
         * @memberof! insight.DataSet
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

        self.group = function(name, groupFunction, oneToMany) {

            self.crossfilterData = self.crossfilterData || crossfilter(self.data);

            var dim = new insight.Dimension(name, self.crossfilterData, groupFunction, oneToMany);

            var group = new insight.Grouping(dim);

            return group;
        };

    };

})(insight);
