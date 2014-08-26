/**
 * A Grouping is generated on a dimension, to reduce the items in the data set into groups along the provided dimension
 * @class insight.Grouping
 * @constructor
 * @param {dimension} dimension - The dimension to group
 */
(function(insight) {

    insight.Grouping = function Grouping(dimension) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            sumProperties = [],
            countProperties = [],
            cumulativeProperties = [],
            averageProperties = [],
            correlationPairProperties = [],
            allCorrelationProperties = [],
            ordered = false,
            filterFunction = null,
            orderFunction;

        // Internal variables -----------------------------------------------------------------------------------------

        self.dimension = dimension;

        // Private functions ------------------------------------------------------------------------------------------

        // The default post aggregation step is blank, and can be overriden by users if they want to calculate additional values with this Grouping
        function postAggregation(grouping) {

        }

        /*
         * Takes an object and a property name in the form of a string, traversing the object until it finds a property with that name and returning
         * a wrapped object with the immediate parent of the found property and the property's value.
         * @param {object} - The object to search
         * @param {string} propertyName - A string of the property to search, can include sub-properties using a dot notation. Eg. 'value.Revenue.Sum', which cannot be indexed directly in Javascript.
         */
        function getDescendant(obj, propertyName) {
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
        }

        /*
         * Takes a group object and calculates the mean for any properties configured.
         * @param {object} group - A dimensional slice of a Grouping {key: 'X', value : {}}
         */
        function calculateAverages(group) {


            for (var i = 0, len = averageProperties.length; i < len; i++) {

                var propertyName = averageProperties[i];
                var propertyValue = group.value[propertyName];
                var mean = propertyValue.Sum / propertyValue.Count;

                mean = insight.Utils.isNumber(mean) && isFinite(mean) ? mean : undefined;

                group.value[propertyName].Average = mean;
            }
        }

        /*
         * Calculates running cumulative values for any properties defined in the cumulative() list.
         * @param {object} group - The data group being added to the cumulative running totals list
         * @param {object} totals - The map object of running totals for the defined properties
         */
        function calculateCumulativeValues(group, totals) {

            var propertyName,
                descendant;

            for (var i = 0, len = cumulativeProperties.length; i < len; i++) {

                propertyName = cumulativeProperties[i];
                descendant = getDescendant(group.value, propertyName);

                var totalName = descendant.propertyName + 'Cumulative';

                totals[totalName] = totals[totalName] ? totals[totalName] + descendant.value : descendant.value;

                descendant.container[totalName] = totals[totalName];

            }

            return totals;
        }

        /*
         * Calculates correlation coefficient values for all configured property pairs on the grouping.
         * So after this function has run there will be a number of properties on the grouping value called
         * 'X_Cor_Y' where X and Y are the configured property names.
         */
        function calculateCorrelations() {

            /*
             * Returns a property name for the deviation product array used in the correlation workings
             */
            function deviationProductNameFunction(xName, yName) {

                return xName + '_' + yName + '_DeviationProduct';

            }

            /*
             * Returns an empty object that will contain the correlation working data
             */
            function correlationReduceInitialize() {

                return {};

            }

            /*
             * Returns the function to use for creating a reduciton of all groups in order to calculate correlation
             * between properties in a group.
             */
            function correlationReduceAdd(aggregatedData) {

                var globalData = aggregatedData;

                /*
                 * This is the function that does the reduction to produce working data for correlation calculations.
                 */
                return function(workings, addingData) {

                    allCorrelationProperties.forEach(function(propertyName) {

                        if (addingData.hasOwnProperty(propertyName)) {

                            // get this grouping from the global data
                            var groupData = insight.Utils.takeWhere(globalData, 'key', self.dimension.aggregationFunction(addingData))[0].value;

                            // get the group mean from global data for this grouping
                            var groupMean = groupData[propertyName].Average;

                            var value = addingData[propertyName];
                            var deviation = value - groupMean;
                            var deviationSquared = deviation * deviation;

                            // we need to track each deviation and its square so add them to workings
                            if (!workings[propertyName]) {
                                workings[propertyName] = {
                                    deviation: [],
                                    deviationSquared: []
                                };
                            }

                            workings[propertyName].deviation.push(deviation);
                            workings[propertyName].deviationSquared.push(deviationSquared);

                        }

                    });

                    // having added to the deviation and deviationSquared we can now add
                    // the product of each pair's deviations to the workings object
                    correlationPairProperties.forEach(function(pair) {

                        var xName = pair[0],
                            yName = pair[1],
                            xDeviation = insight.Utils.lastElement(workings[xName].deviation),
                            yDeviation = insight.Utils.lastElement(workings[yName].deviation),
                            correlationName = deviationProductNameFunction(xName, yName);

                        if (!workings[correlationName]) {
                            workings[correlationName] = [];
                        }

                        workings[correlationName].push(xDeviation * yDeviation);

                    });

                    return workings;

                };

            }

            function correlationReduceRemove(aggregatedData) {

                return function() {

                };

            }

            var completeData = self.data.all();

            // the correlationData reduction calculates the deviation squared for
            // all properties in allCorrelationProperties (a private variable on Grouping)
            var correlationWorkingData = self.dimension.crossfilterDimension.group()
                .reduce(
                    correlationReduceAdd(completeData),
                    correlationReduceRemove(completeData),
                    correlationReduceInitialize)
                .all();

            correlationWorkingData.forEach(function(d) {

                function sum(array) {
                    return array.reduce(function(previous, current) {
                        return previous + current;
                    });
                }

                correlationPairProperties.forEach(function(pair) {

                    var xName = pair[0];
                    var yName = pair[1];
                    var deviationProductName = deviationProductNameFunction(xName, yName);
                    var sumDeviationProduct = sum(d.value[deviationProductName]);
                    var sumXDeviationSquared = sum(d.value[xName].deviationSquared);
                    var sumYDeviationSquared = sum(d.value[yName].deviationSquared);

                    var correlationCoefficient = sumDeviationProduct / Math.sqrt(sumXDeviationSquared * sumYDeviationSquared);

                    var thisGroup = completeData.filter(function(item) {
                        return item.key === d.key;
                    })[0];

                    var correlationName = xName + '_Cor_' + yName;
                    thisGroup.value[correlationName] = correlationCoefficient;

                });

            });

        }

        /*
         * Used to calculate any values that need to run after the data set has been aggregated into groups and basic values
         */
        function postAggregationCalculations() {

            var totals = {};

            var data = self.isOrdered() ? self.getData(self.orderFunction()) : self.getData();

            data.forEach(function(d) {

                calculateAverages(d);

                calculateCumulativeValues(d, totals);

            });

            if (correlationPairProperties.length > 0) {

                calculateCorrelations();

            }

            // Run any user injected functions post aggregation
            postAggregation(self);
        }

        /*
         * Called by the map reduce process on a DataSet when an input object is being added to the aggregated group
         * @returns {object} group - The group entry for this slice of the aggregated dataset, modified by the addition of the data object
         * @param {object} group - The group entry for this slice of the aggregated dataset, prior to adding the input data object
         * @param {object} data - The object being added from the aggregated group.
         */
        function reduceAddToGroup(group, data) {

            group.Count++;

            var propertyName,
                i,
                len;

            for (i = 0, len = sumProperties.length; i < len; i++) {
                propertyName = sumProperties[i];

                if (data.hasOwnProperty(propertyName)) {
                    group[propertyName].Sum += data[propertyName];
                    group[propertyName].Count++;
                }
            }

            // Increment the counts of the different occurences of any properties defined. E.g: if a property 'Country' can take multiple string values,
            // this counts the occurences of each distinct value the property takes
            for (i = 0, len = countProperties.length; i < len; i++) {
                propertyName = countProperties[i];

                var groupProperty = group[propertyName];

                if (data.hasOwnProperty(propertyName)) {

                    var propertyValue = data[propertyName];

                    // If this property holds multiple values, increment the counts for each one.
                    if (insight.Utils.isArray(propertyValue)) {

                        for (var subIndex in propertyValue) {
                            var subVal = propertyValue[subIndex];
                            //Initialize or increment the count for this occurence of the property value
                            group[propertyName][subVal] = groupProperty.hasOwnProperty(subVal) ? groupProperty[subVal] + 1 : 1;
                            group[propertyName].Total++;
                        }
                    } else {
                        group[propertyName][propertyValue] = groupProperty.hasOwnProperty(propertyValue) ? groupProperty[propertyValue] + 1 : 1;
                        group[propertyName].Total++;
                    }
                }
            }

            return group;
        }

        /*
         * Called by the map reduce process on a DataSet when an input object is being filtered out of the group
         * @returns {object} group - The group entry for this slice of the aggregated dataset, modified by the removal of the data object
         * @param {object} group - The group entry for this slice of the aggregated dataset, prior to removing the input data object
         * @param {object} data - The object being removed from the aggregated group.
         */
        function reduceRemoveFromGroup(group, data) {

            group.Count--;

            var propertyName,
                i,
                len;

            for (i = 0, len = sumProperties.length; i < len; i++) {
                propertyName = sumProperties[i];

                if (data.hasOwnProperty(propertyName)) {
                    group[propertyName].Sum -= data[propertyName];
                    group[propertyName].Count--;
                }
            }

            for (i = 0, len = countProperties.length; i < len; i++) {
                propertyName = countProperties[i];

                if (data.hasOwnProperty(propertyName)) {

                    var propertyValue = data[propertyName];

                    if (insight.Utils.isArray(propertyValue)) {

                        for (var subIndex in propertyValue) {
                            var subVal = propertyValue[subIndex];
                            group[propertyName][subVal] = group[propertyName].hasOwnProperty(subVal) ? group[propertyName][subVal] - 1 : 0;
                            group[propertyName].Total--;
                        }

                    } else {
                        group[propertyName][propertyValue] = group[propertyName].hasOwnProperty(propertyValue) ? group[propertyName][propertyValue] - 1 : 0;
                        group[propertyName].Total--;
                    }
                }
            }

            return group;
        }

        /*
         * Called when a slice of an aggrgated DataSet is being initialized, creating initial values for certain properties
         * @returns {object} return - The initialized slice of this aggreagted DataSet.  The returned object will be of the form {key: '
         Distinct Key ', value: {}}
         */
        function reduceInitializeGroup() {
            var group = {
                    Count: 0
                },
                propertyName,
                i,
                len;


            for (i = 0, len = sumProperties.length; i < len; i++) {
                propertyName = sumProperties[i];

                group[propertyName] = group[propertyName] ? group[propertyName] : {};
                group[propertyName].Sum = 0;
                group[propertyName].Count = 0;
            }

            for (i = 0, len = countProperties.length; i < len; i++) {
                propertyName = countProperties[i];
                group[propertyName] = group[propertyName] ? group[propertyName] : {};
                group[propertyName].Total = 0;
            }

            return group;
        }

        /*
         * This aggregation method is tailored to dimensions that can hold multiple values (in an array), therefore they are counted differently.
         * For example: a property called supportedDevices : ['iPhone5 ', 'iPhone4 '] where the values inside the array are treated as dimensional slices
         * @returns {object[]} return - the array of dimensional groupings resulting from this dimensional aggregation
         */
        function reduceMultidimension() {

            var propertiesToCount = self.count();

            var propertyName,
                i,
                index = 0,
                len,
                gIndices = {};

            function reduceAdd(p, v) {

                for (i = 0, len = propertiesToCount.length; i < len; i++) {

                    propertyName = propertiesToCount[i];

                    if (v.hasOwnProperty(propertyName)) {
                        for (var val in v[propertyName]) {
                            if (typeof(gIndices[v[propertyName][val]]) !== "undefined") {
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
                for (i = 0, len = propertiesToCount.length; i < len; i++) {

                    propertyName = propertiesToCount[i];

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

            var data = self.dimension.crossfilterDimension.groupAll()
                .reduce(reduceAdd, reduceRemove, reduceInitial);

            self.orderFunction(function(a, b) {
                return b.value - a.value;
            });

            return data;
        }

        // Internal functions -----------------------------------------------------------------------------------------

        /*
         * Gets the function that will run after the map reduce stage of this Grouping's aggregation.This is an empty
         * function by default, and can be overriden by the setter.
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
        self.postAggregation = function(postAggregationFunc) {
            if (!arguments.length) {
                return postAggregation;
            }
            postAggregation = postAggregationFunc;
            return self;
        };

        /*
         * Called when any post aggregation calculations need to be recalculated.
         * For example, calculating group percentages after totals have been created during map-reduce.
         * @memberof! insight.Grouping
         * @instance
         */
        self.recalculate = function() {

            postAggregationCalculations();
        };

        /*
         * Performs the aggregation of the underlying crossfilter dimension, calculating any additional properties during the map-reduce phase.
         * It must be run prior to a group being used
         * @todo This should probably be run during the constructor? If not, lazily evaluated by getData() if it hasn't been run already.
         */
        self.initialize = function() {

            var basicGroupData;

            if (self.dimension.oneToMany) {
                // Dimensions that are one to many {supportedLanguages: ['EN', 'DE']} as opposed to {supportedLanguage: 'EN'} need to be aggregated differently
                basicGroupData = reduceMultidimension();
            } else {
                // this is crossfilter code.  It calls the crossfilter.group().reduce() functions on the crossfilter dimension wrapped inside our insight.Dimension
                // more info at https://github.com/square/crossfilter/wiki/API-Reference
                // the add, remove and initialie functions are called when crossfilter is aggregating the groups, and is amending the membership of the different
                // dimensional slices (groups)
                basicGroupData = self.dimension.crossfilterDimension.group()
                    .reduce(
                        reduceAddToGroup,
                        reduceRemoveFromGroup,
                        reduceInitializeGroup
                );


            }

            self.data = basicGroupData;

            postAggregationCalculations(self);

            return self;
        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * Returns the list of properties to be summed on this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will be summed
         *
         * @also
         *
         * Sets the list of property names that will be summed in this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of property names to be summed for slices in this Grouping.
         */
        self.sum = function(properties) {
            if (!arguments.length) {
                return sumProperties;
            }
            sumProperties = properties;
            return self;
        };

        /*
         * Returns the list of property pairs whose correlation coefficient should be caclulated in this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {Array<String[]>} - The list of property pairs that will be summed.Each pair is an array of two strings
         * @also
         * Sets the list of property pairs whose correlation coefficient should be caclulated in this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {Array<String[]>} properties - An array of property pairs whose correlation coefficient should
         * be caclulated in this Grouping
         */
        self.correlationPairs = function(properties) {
            if (!arguments.length) {
                return correlationPairProperties;
            }

            correlationPairProperties = properties;

            for (var i = 0, len = properties.length; i < len; i++) {
                insight.Utils.addToSet(allCorrelationProperties, properties[i][0]);
                insight.Utils.addToSet(allCorrelationProperties, properties[i][1]);
            }

            // need mean for correlation
            averageProperties = insight.Utils.arrayUnique(averageProperties.concat(allCorrelationProperties));

            // need sum for mean so set that too
            sumProperties = insight.Utils.arrayUnique(sumProperties.concat(allCorrelationProperties));

            return self;
        };

        /**
         * Returns the list of properties that will be cumulatively summed over this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will be cumulatively summed
         *
         * @also
         *
         * Sets the list of properties that will be cumulatively summed over this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of property names to be cumulatively summed over slices in this Grouping.
         */
        self.cumulative = function(properties) {
            if (!arguments.length) {
                return cumulativeProperties;
            }
            cumulativeProperties = properties;
            return self;
        };

        /**
         * Returns the list of properties whose distinct value occurences will be counted during the reduction of this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names whose values will be counted
         *
         * @also
         *
         * Sets the array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of properties whose distinct value occurences will be counted during the reduction of this Grouping
         */
        self.count = function(properties) {
            if (!arguments.length) {
                return countProperties;
            }
            countProperties = properties;
            return self;
        };

        /**
         * Returns the list of properties whose mean will be calculated after the map reduce of this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {string[]} - The list of property names that will averaged
         *
         * @also
         *
         * Sets the array of properties whose mean will be calculated after the map reduce of this Grouping.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {string[]} properties - An array of properties that will be averaged after the map reduce of this Grouping.
         */
        self.mean = function(properties) {
            if (!arguments.length) {
                return averageProperties;
            }
            averageProperties = properties;

            sumProperties = insight.Utils.arrayUnique(sumProperties.concat(averageProperties));

            return self;
        };

        /**
         * The function used to compare the elements in this grouping if sorting is requested.
         * @instance
         * @memberof! insight.Grouping
         * @returns {Function} orderingFunction - The function used to compare two values when sort() is called on an array
         *
         * @also
         *
         * Sets the function used to compare the elements in this grouping if sorting is requested.
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {Function} orderingFunction - The comparison function to be used to sort the elements in this group.
         * The function should take the form of a standard
         * {@link https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/GlobalvalueObjects/Array/sort|Javascript comparison function}.
         */
        self.orderFunction = function(orderingFunction) {
            if (!arguments.length) {
                return orderFunction;
            }
            orderFunction = orderingFunction;
            return self;
        };

        /**
         * Whether the group's data is ordered.
         * @instance
         * @memberof! insight.Grouping
         * @returns {boolean} - Whether the group's data is ordered.
         *
         * @also
         *
         * Sets if this Grouping will be ordered or not
         * @instance
         * @memberof! insight.Grouping
         * @returns {this}
         * @param {boolean} ordered - Whether to order this Grouping or not
         */
        self.isOrdered = function(value) {
            if (!arguments.length) {
                return ordered;
            }
            ordered = value;

            return self;
        };

        /**
         * The function used to filter the results returned by this grouping.
         * The function returns true to keep the value, or false to remove it from the final result.
         * @instance
         * @memberof! insight.Grouping
         * @returns {Function} - The function used to filter the results returned by this grouping.
         *
         * @also
         *
         * Sets the function used to filter the results returned by this grouping.
         * The function returns true to keep the value, or false to remove it from the final result.
         * @instance
         * @memberof! insight.Grouping
         * @param {Function} filterFunc - The function used to filter the results returned by this grouping.
         * @returns {this}
         */
        self.filterFunction = function(filterFunc) {
            if (!arguments.length) {
                return filterFunction;
            }
            filterFunction = filterFunc;
            return self;
        };

        /**
         * Used to return the group's data, without ordering.  It checks if there is any filtering requested and applies the filter to the return array.
         * @memberof! insight.Grouping
         * @instance
         * @returns {object[]} return - The grouping's data in an object array, with an object per slice of the dimension.
         */
        self.getData = function(orderFunction, top) {
            var data;

            // Set the provided order function if it has been given, otherwise use the inherent grouping order if one has been defined.
            var orderFunc = orderFunction ? orderFunction : self.orderFunction();

            if (!self.data) {
                self.initialize();
            }

            if (self.dimension.oneToMany) {
                data = self.data.value()
                    .values;
            } else {
                data = self.data.all();
            }

            // take a copy of the array to not alter the original dataset
            data = data.slice(0);

            if (orderFunc) {
                data = data.sort(orderFunc);
            }
            if (top) {
                data = data.slice(0, top);
            }

            if (filterFunction) {
                data = data.filter(filterFunction);
            }

            return data;
        };

    };

})(insight);
