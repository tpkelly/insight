(function(insight) {
    /*
     * A Dimension organizes a dataset along a particular property, or variation of a property.
     * Defining a dimension with a function of:<pre><code>function(d){ return d.Surname; }</code></pre> will slice a dataset by the distinct values of the Surname property.
     * @constructor
     * @param {String} name - The short name used to identify this dimension, and any linked dimensions sharing the same name
     * @param {Object} crossfilterData - The crossfilter object to create the Dimension on.
     * @param {Function} sliceFunction - The function used to categorize points within the dimension.
     * @param {Boolean} oneToMany - Whether or not this dimension represents a collection of possible values in each item.
     * @class
     */
    insight.Dimension = function Dimension(name, crossfilterData, sliceFunction, oneToMany) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -----------------------------------------------------------------------------------------

        self.crossfilterDimension = crossfilterData.dimension(sliceFunction);
        self.name = name;
        self.filters = [];
        self.oneToMany = oneToMany;
        self.aggregationFunction = sliceFunction;

        // Private functions ------------------------------------------------------------------------------------------

        function oneToManyFilterFunction(filterValue) {
            return function(d) {
                return insight.Utils.arrayContains(d, filterValue);
            };
        }

        function filterFunction(filterValue) {
            return function(d) {
                return String(d) === String(filterValue);
            };
        }

        // Internal functions -----------------------------------------------------------------------------------------

        /*
         * Local helper function that creates a filter object given an element that has been clicked on a Chart or Table.
         * The filter object creates the function used by crossfilter to remove or add objects to an aggregation after a filter event.
         * It also includes a simple name variable to use for lookups.
         * @memberof! insight.Dimension
         * @param {Object} filteredValue - The value to create a crossfilter filter function for.
         * @returns {Function} - A function that a crossfilterdimension.filter() operation can use to map-reduce crossfilter aggregations.
         */
        self.createFilterFunction = function(filteredValue) {

            // create the appropriate type of filter function for this Dimension
            var filterFunc = self.oneToMany ? oneToManyFilterFunction(filteredValue) : filterFunction(filteredValue);

            return {
                name: filteredValue,
                filterFunction: filterFunc
            };
        };

        self.applyFilter = function(filteredDimensions, filterFunc) {

            var nameProperty = 'name';

            var filterExists = insight.Utils.takeWhere(self.filters, nameProperty, filterFunc.name).length;

            //if the dimension is already filtered by this value, toggle (remove) the filter
            if (filterExists) {
                insight.Utils.removeWhere(self.filters, nameProperty, filterFunc.name);

            } else {
                // add the provided filter to the list for this dimension

                self.filters.push(filterFunc);
            }

            // reset this dimension if no filters exist, else apply the filter to the dataset.
            if (self.filters.length === 0) {

                insight.Utils.removeItemFromArray(filteredDimensions, self);
                self.crossfilterDimension.filterAll();

            } else {
                self.crossfilterDimension.filter(function(d) {

                    // apply all of the filters on this dimension to the current value, returning an array of
                    // true/false values (which filters does it satisfy)
                    var vals = self.filters
                        .map(function(func) {
                            return func.filterFunction(d);
                        });

                    // if this value satisfies any of the filters, it should be kept
                    var matchesAnyFilter = vals.filter(function(result) {
                            return result;
                        })
                        .length > 0;

                    return matchesAnyFilter;
                });
            }

        };

        self.clearFilters = function() {

            self.filters = [];
            self.crossfilterDimension.filterAll();

        };

    };

})(insight);
