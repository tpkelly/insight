/**
 * A Grouping is generated on a dimension, to reduce the items in the data set into groups along the provided dimension
 * @class insight.Grouping
 * @constructor
 * @param {Dimension} dimension - The dimension to group
 */
insight.Grouping = (function(insight) {

    function Grouping(dimension) {

        this.dimension = dimension;

        var sumProperties = [],
            countProperties = [],
            cumulativeProperties = [],
            averageProperties = [],
            ordered = false,
            self = this,
            filterFunction = null;

        // Private methods

        // The default post aggregation step is blank, and can be overriden by users if they want to calculate additional values with this Grouping
        var postAggregation = function() {

        };

        var orderFunction = function(a, b) {
            return b.value.Count - a.value.Count;
        };

        /*
         * This function takes an object and a property name in the form of a string, traversing the object until it finds a property with that name and returning
         * a wrapped object with the immediate parent of the found property and the property's value.
         * @param {object} - The object to search
         * @param {string} propertyName - A string of the property to search, can include sub-properties using a dot notation. Eg. 'value.Revenue.Sum', which cannot be indexed directly in Javascript.
         */
        var getDescendant = function(obj, propertyName) {
            var arr = propertyName.split(".");
            var name = propertyName;
            var container = null;

            while (arr.length) {
                name = arr.shift();
                container = obj;
                obj = obj[name];
            }
            return {
                container: container,
                value: obj,
                propertyName: name
            };
        };

        /*
         * This function takes a group object and calculates the mean for any properties configured.
         * @param {object} group - A dimensional slice of a Grouping {key: 'X', value : {}}
         */
        var calculateAverages = function(group) {

            var propertiesToAverage = self.mean();

            for (var i = 0, len = propertiesToAverage.length; i < len; i++) {

                var propertyName = propertiesToAverage[i];
                var propertyValue = group.value[propertyName];
                var mean = propertyValue.Sum / group.value.Count;

                mean = insight.Utils.isNumber(mean) & isFinite(mean) ? mean : 0;

                group.value[propertyName].Average = mean;
            }
        };

        /*
         * This method calculates running cumulative values for any properties defined in the cumulative() list.
         * @param {object} data - The data group being added to the cumulative running totals list
         * @param {object} totals - The map object of running totals for the defined properties
         */
        var calculateCumulativeValues = function(d, totals) {

            var cumulativeProperties = self.cumulative();
            var propertyName,
                descendant;

            for (var i = 0, len = cumulativeProperties.length; i < len; i++) {

                propertyName = cumulativeProperties[i];
                descendant = getDescendant(d.value, propertyName);

                var totalName = descendant.propertyName + 'Cumulative';

                totals[totalName] = totals[totalName] ? totals[totalName] + descendant.value : descendant.value;

                descendant.container[totalName] = totals[totalName];

            }

            return totals;
        };

        /**
         * This method is used to calculate any values that need to run after the data set has been aggregated into groups and basic values
         */
        var postAggregationCalculations = function() {

            var totals = {};

            var data = self.ordered() ? self.getData(self.orderFunction()) : self.getData();

            data.forEach(function(d) {

                calculateAverages(d);

                calculateCumulativeValues(d, totals);

            });
        };



        // Public methods

        /** 
         * This function is called by Series that use this Grouping, to wire up their click events to the filter event of this Grouping
         * TODO - temporary, this needs to be removed from here (and series) and put into a new ChartGroup, ChartContainer or Dashboard type entity
         * @param {insight.Series} series - The series registering with this Grouping
         */
        this.register = function(series) {
            series.clickEvent = this.filterHandler;
        };

        /** 
         * This handler is exposed by a Grouping and overriden by the global namespace when it wants to listen to this Grouping's filter events and wire them up to other Groupings and charts.
         */
        this.filterHandler = function(series, filter, dimensionSelector) {

        };

        /**
         * Gets the function that will run after the map reduce stage of this Grouping's aggregation. This is an empty function by default, and can be overriden by the setter.
         * @instance
         * @memberof! insight.Grouping
         * @returns {function} - The function that will run after aggregation of this Grouping.
         * @also
         * Sets the function that will run after any aggregation has been performed on this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} postAggregationFunc - A user defined function of the form function(grouping), that the Grouping will run post aggregation.
         */
        this.postAggregation = function(postAggregationFunc) {
            if (!arguments.length) {
                return postAggregation;
            }
            postAggregation = postAggregationFunc;
            return this;
        };

        /**
         * Returns the list of properties to be summed on this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will be summed
         * @also
         * Sets the list of property names that will be summed in this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of property names to be summed for slices in this Grouping.
         */
        this.sum = function(properties) {
            if (!arguments.length) {
                return sumProperties;
            }
            sumProperties = properties;
            return this;
        };

        /**
         * Returns the list of properties that will be cumulatively summed over this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will be cumulatively summed
         * @also
         * Sets the list of properties that will be cumulatively summed over this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of property names to be cumulatively summed over slices in this Grouping.
         */
        this.cumulative = function(properties) {
            if (!arguments.length) {
                return cumulativeProperties;
            }
            cumulativeProperties = properties;
            return this;
        };

        /**
         * Returns the array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names whose values will be counted
         * @also
         * Sets the array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         */
        this.count = function(properties) {
            if (!arguments.length) {
                return countProperties;
            }
            countProperties = properties;
            return this;
        };

        /**
         * Returns the array of properties whose mean will be calculated after the map reduce of this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will averaged
         * @also
         * Sets the array of properties whose mean will be calculated after the map reduce of this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of properties that will be averaged after the map reduce of this Grouping.
         */
        this.mean = function(properties) {
            if (!arguments.length) {
                return averageProperties;
            }
            averageProperties = properties;

            sumProperties = insight.Utils.arrayUnique(sumProperties.concat(averageProperties));

            return this;
        };

        /**
         * Gets or sets the function used to compare the elements in this grouping if sorting is requested.
         * @instance
         * @memberof! insight.Grouping
         * @returns {function} orderingFunction - The function used to compare two values when sort() is called on an array
         * @also
         * Sets the function used to compare the elements in this grouping if sorting is requested.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {function} function - The comparison function to be used to sort the elements in this group.  The function should take the form of a standard {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/GlobalvalueObjects/Array/sort|Javascript comparison function}.
         */
        this.orderFunction = function(orderingFunction) {
            if (!arguments.length) {
                return orderFunction;
            }
            orderFunction = orderingFunction;
            return this;
        };


        /**
         * Gets or sets whether the group's data is ordered.
         * @instance
         * @memberof! insight.Grouping
         * @returns {boolean}
         * @also
         * Sets if this Grouping will be ordered or not
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {boolean} ordered - Whether to order this Grouping or not
         */
        this.ordered = function(value) {
            if (!arguments.length) {
                return ordered;
            }
            ordered = value;

            return this;
        };

        /**
         * The filter method gets or sets the function used to filter the results returned by this grouping.
         * @param {function} filterFunction - A function taking a parameter representing an object in the list.  The function must return true or false as per <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/GlobalvalueObjects/Array/filter">Array Filter</a>.
         */
        this.filter = function(f) {
            if (!arguments.length) {
                return filterFunction;
            }
            filterFunction = f;
            return this;
        };


        /**
         * This aggregation method is tailored to dimensions that can hold multiple values (in an array), therefore they are counted differently.
         * For example: a property called supportedDevices : ['iPhone5', 'iPhone4'] where the values inside the array are treated as dimensional slices
         * @returns {object[]} return - the array of dimensional groupings resulting from this dimensional aggregation
         */
        this.reduceMultiDimension = function() {

            var propertiesToSum = self.sum();
            var propertiesToCount = self.count();
            var propertiesToAverage = self.mean();

            var index = 0;
            var gIndices = {};

            function reduceAdd(p, v) {
                for (var prop in propertiesToCount) {
                    var propertyName = propertiesToCount[prop];

                    if (v.hasOwnProperty(propertyName)) {
                        for (var val in v[propertyName]) {
                            if (typeof(gIndices[v[propertyName][val]]) != "undefined") {
                                var gIndex = gIndices[v[propertyName][val]];

                                p.values[gIndex].value++;
                            } else {
                                gIndices[v[propertyName][val]] = index;

                                p.values[index] = {
                                    key: v[propertyName][val],
                                    value: 1
                                };

                                index++;
                            }
                        }
                    }
                }
                return p;
            }

            function reduceRemove(p, v) {
                for (var prop in propertiesToCount) {
                    var propertyName = propertiesToCount[prop];

                    if (v.hasOwnProperty(propertyName)) {
                        for (var val in v[propertyName]) {
                            var property = v[propertyName][val];

                            var gIndex = gIndices[property];

                            p.values[gIndex].value--;
                        }
                    }
                }
                return p;
            }

            function reduceInitial() {

                return {
                    values: []
                };
            }

            data = self.dimension.Dimension.groupAll()
                .reduce(reduceAdd, reduceRemove, reduceInitial);

            self.orderFunction(function(a, b) {
                return b.value - a.value;
            });

            return data;
        };

        /**
         * This method is called when any post aggregation calculations need to be recalculated.
         * For example, calculating group percentages after totals have been created during map-reduce.
         * @memberof! insight.Grouping
         * @instance
         */
        this.recalculate = function() {

            postAggregationCalculations();
        };

        /**
         * This method performs the aggregation of the underlying crossfilter dimension, calculating any additional properties during the map-reduce phase.
         * It must be run prior to a group being used
         * @todo This should probably be run during the constructor? If not, lazily evaluated by getData() if it hasn't been run already.
         */
        this.initialize = function() {
            var propertiesToSum = this.sum();
            var propertiesToCount = this.count();
            var propertiesToAverage = this.mean();
            var propertyName = "";

            var data = [];

            if (self.dimension.multiple) {
                data = self.reduceMultiDimension();
            } else {
                data = self.dimension.Dimension.group()
                    .reduce(
                        function(p, v) {
                            p.Count++;

                            for (var property in propertiesToSum) {
                                if (v.hasOwnProperty(propertiesToSum[property])) {
                                    p[propertiesToSum[property]].Sum += v[propertiesToSum[property]];
                                }
                            }

                            for (var countProp in propertiesToCount) {
                                if (v.hasOwnProperty(propertiesToCount[countProp])) {
                                    propertyName = propertiesToCount[countProp];
                                    var propertyValue = v[propertiesToCount[countProp]];

                                    if (insight.Utils.isArray(propertyValue)) {

                                        for (var subIndex in propertyValue) {
                                            var subVal = propertyValue[subIndex];
                                            p[propertyName][subVal] = p[propertyName].hasOwnProperty(subVal) ? p[propertyName][subVal] + 1 : 1;
                                            p[propertyName].Total++;
                                        }

                                    } else {
                                        p[propertyName][propertyValue] = p[propertyName].hasOwnProperty(propertyValue) ? p[propertyName][propertyValue] + 1 : 1;
                                        p[propertyName].Total++;
                                    }
                                }
                            }

                            return p;
                        },
                        function(p, v) {
                            p.Count--;

                            for (var property in propertiesToSum) {
                                if (v.hasOwnProperty(propertiesToSum[property])) {
                                    p[propertiesToSum[property]].Sum -= v[propertiesToSum[property]];
                                }
                            }

                            for (var countProp in propertiesToCount) {
                                if (v.hasOwnProperty(propertiesToCount[countProp])) {

                                    propertyName = propertiesToCount[countProp];
                                    var propertyValue = v[propertiesToCount[countProp]];

                                    if (insight.Utils.isArray(propertyValue)) {

                                        for (var subIndex in propertyValue) {
                                            var subVal = propertyValue[subIndex];
                                            p[propertyName][subVal] = p[propertyName].hasOwnProperty(subVal) ? p[propertyName][subVal] - 1 : 0;
                                            p[propertyName].Total--;
                                        }

                                    } else {
                                        p[propertyName][propertyValue] = p[propertyName].hasOwnProperty(propertyValue) ? p[propertyName][propertyValue] - 1 : 0;
                                        p[propertyName].Total--;
                                    }

                                }
                            }

                            return p;
                        },
                        function() {
                            var p = {
                                Count: 0
                            };

                            for (var property in propertiesToSum) {
                                p[propertiesToSum[property]] = p[propertiesToSum[property]] ? p[propertiesToSum[property]] : {};
                                p[propertiesToSum[property]].Sum = 0;
                            }
                            for (var avProperty in propertiesToAverage) {
                                p[propertiesToAverage[avProperty]] = p[propertiesToAverage[avProperty]] ? p[propertiesToAverage[avProperty]] : {};
                                p[propertiesToAverage[avProperty]].Average = 0;
                            }
                            for (var countProp in propertiesToCount) {
                                p[propertiesToCount[countProp]] = p[propertiesToCount[countProp]] ? p[propertiesToCount[countProp]] : {};
                                p[propertiesToCount[countProp]].Total = 0;
                            }
                            return p;
                        }
                );
            }
            self.data = data;

            self.recalculate();

            return this;
        };


        /**
         * This method is used to return the group's data, without ordering.  It checks if there is any filtering requested and applies the filter to the return array.
         * @memberof! insight.Grouping
         * @instance
         * @returns {object[]} return - The grouping's data in an object array, with an object per slice of the dimension.
         */
        this.getData = function(orderFunction, top) {
            var data;

            if (!self.data) {
                self.initialize();
            }

            if (this.dimension.multiple) {
                data = self.data.value()
                    .values;
            } else {
                data = self.data.all();
            }

            // take a copy of the array to not alter the original dataset
            data = data.slice(0);

            if (orderFunction) {
                data = data.sort(orderFunction);
            }
            if (top) {
                data = data.slice(0, top);
            }

            if (filterFunction) {
                data = data.filter(filterFunction);
            }

            return data;
        };

    }

    return Grouping;

})(insight);
