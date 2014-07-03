/**
 * This is the global namespace that also handles some global events and filtering logic (the logic could be moved into a specific class as it gets larger)
 * @namespace insight
 */
var insight = (function() {

    return {
        Charts: [],
        Groups: [],
        Dimensions: [],
        FilteredDimensions: [],
        DimensionChartMap: {},
        init: function() {
            this.Charts = [];
            this.Groups = [];
            this.FilteredDimensions = [];
            this.DimensionChartMap = {};
        },
        redrawCharts: function() {
            for (var i = 0; i < this.Charts
                .length; i++) {
                this.Charts[i].draw();
            }
        },
        addChart: function(chart) {

            var self = this;

            chart.triggerRedraw = this.redrawCharts.bind(this);

            this.Charts.push(chart);

            return chart;
        },
        filterFunction: function(filter, element) {
            var value = filter.key ? filter.key : filter;

            return {
                name: value,
                filterFunction: function(d) {
                    if (Array.isArray(d)) {
                        return d.indexOf(value) != -1;
                    } else {
                        return String(d) == String(value);
                    }
                }
            };
        },
        compareFilters: function(filterFunction) {
            return function(d) {
                return String(d.name) == String(filterFunction.name);
            };
        },
        applyCSSClasses: function(chart, value, dimensionSelector) {
            var listeningSeries = this.DimensionChartMap[chart.data.dimension.Name];

            listeningSeries.forEach(function(chart) {

                chart.highlight(dimensionSelector, value);


            });
        },
        drawCharts: function() {

            var self = this;

            this.Charts
                .forEach(
                    function(chart) {

                        chart.series()
                            .forEach(function(s) {
                                if (s.data.dimension) {
                                    if (self.DimensionChartMap[s.data.dimension.Name]) {
                                        if (self.DimensionChartMap[s.data.dimension.Name].indexOf(chart) == -1) {
                                            self.DimensionChartMap[s.data.dimension.Name].push(chart);
                                        }
                                    } else {
                                        self.DimensionChartMap[s.data.dimension.Name] = [chart];
                                    }
                                }
                            });

                        chart.init();
                    });

            for (var i = 0; i < this.Charts
                .length; i++) {
                this.Charts[i].draw();
            }

        },
        chartFilterHandler: function(chart, value, dimensionSelector) {
            var self = this;

            this.applyCSSClasses(chart, value, dimensionSelector);

            var dimension = chart.data.dimension;

            var filterFunction = this.filterFunction(value);

            if (filterFunction) {
                var dims = this.Dimensions
                    .filter(dimension.comparer);

                var activeDim = this.FilteredDimensions
                    .filter(dimension.comparer);

                if (!activeDim.length) {
                    this.FilteredDimensions.push(dimension);
                }

                var comparerFunction = this.compareFilters(filterFunction);

                dims.map(function(dim) {

                    var filterExists = dim.Filters
                        .filter(comparerFunction)
                        .length;

                    //if the dimension is already filtered by this value, toggle (remove) the filter
                    if (filterExists) {
                        InsightUtils.removeMatchesFromArray(dim.Filters, comparerFunction);

                    } else {
                        // add the provided filter to the list for this dimension

                        dim.Filters.push(filterFunction);
                    }

                    // reset this dimension if no filters exist, else apply the filter to the dataset.
                    if (dim.Filters.length === 0) {

                        InsightUtils.removeItemFromArray(self.FilteredDimensions, dim);
                        dim.Dimension.filterAll();

                    } else {
                        dim.Dimension.filter(function(d) {
                            var vals = dim.Filters
                                .map(function(func) {
                                    return func.filterFunction(d);
                                });

                            return vals.filter(function(result) {
                                    return result;
                                })
                                .length > 0;
                        });
                    }
                });

                this.Groups.forEach(function(group) {
                    group.recalculate();

                });

                this.redrawCharts();
            }
        }
    };

})();
;insight.Constants = (function() {
    var exports = {};

    exports.Behind = 'behind';
    exports.Front = 'front';
    exports.AxisTextClass = 'axis-text';
    exports.AxisLabelClass = 'axis-label';
    exports.YAxisClass = 'y-axis';
    exports.AxisClass = 'in-axis';
    exports.XAxisClass = 'x-axis';
    exports.XAxisRotation = "rotate(90)";
    exports.ToolTipTextClass = "tooltip";
    exports.BarGroupClass = "bargroup";
    exports.ContainerClass = "incontainer";
    exports.ChartSVG = "chartSVG";
    exports.Bubble = "bubble";

    return exports;
}());


insight.Scales = (function() {
    var exports = {};

    exports.Ordinal = {
        name: "ordinal",
        scale: d3.scale.ordinal
    };
    exports.Linear = {
        name: "linear",
        scale: d3.scale.linear
    };
    exports.Time = {
        name: "time",
        scale: d3.time.scale
    };
    return exports;
}());
;var InsightFormatters = (function(d3) {
    var exports = {};


    exports.moduleProperty = 1;

    exports.currencyFormatter = function(value) {
        var format = d3.format("0,000");
        return '£' + format(value);
    };

    exports.decimalCurrencyFormatter = function(value) {
        var format = d3.format("0.2f");
        return '£' + format(value);
    };

    exports.numberFormatter = function(value) {
        var format = d3.format("0,000");
        return format(value);
    };

    exports.dateFormatter = function(value) {
        var format = d3.time.format("%b %Y");
        return format(value);
    };

    exports.percentageFormatter = function(value) {
        var format = d3.format("%");
        return format(value);
    };

    return exports;
}(d3));
;/**
 * This modules contains some helper functions used throughout the library
 * @module InsightUtils
 */
insight.Utils = (function() {

    var exports = {};

    /**
     * This is a utility method used to check if an object is an array or not
     * @returns {boolean} return - is the object an array
     * @param {object} input - The object to check
     */
    exports.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };


    exports.isDate = function(obj) {
        return obj instanceof Date;
    };

    exports.isNumber = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Number]';
    };

    exports.removeMatchesFromArray = function(array, comparer) {
        var self = this;
        var matches = array.filter(comparer);
        matches.forEach(function(match) {
            self.removeItemFromArray(array, match);
        });
    };

    exports.removeItemFromArray = function(array, item) {
        var index = array.indexOf(item);
        if (index > -1) {
            array.splice(index, 1);
        }
    };

    exports.safeString = function(input) {
        return input.split(' ')
            .join('_');
    };

    return exports;
}());
;insight.DataSet = (function(insight) {
    /**
     * A DataSet is wrapper around a simple object array, but providing some functions that are required by charts to load and filter data.
     * A DataSet should be used with an array of data that is to be charted without being used in a crossfilter or dimensional dataset.
     * @constructor
     * @param {object[]} data - The short name used to identify this dimension, and any linked dimensions sharing the same name
     */
    function DataSet(data) {

        this._data = data;

        this.Dimensions = [];
        this.Groups = [];

        this.ndx = null;

        this._orderFunction = function(a, b) {
            return b.value - a.value;
        };

        this._filterFunction = null;
    }

    DataSet.prototype.initialize = function() {

    };

    DataSet.prototype.filterFunction = function(f) {
        if (!arguments.length) {
            return this._filterFunction;
        }
        this._filterFunction = f;
        return this;
    };

    DataSet.prototype.getData = function() {
        var data;
        if (this._data.all) {
            data = this._data.all();
        } else {
            //not a crossfilter set
            data = this._data;
        }

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };

    DataSet.prototype.orderFunction = function(o) {
        if (!arguments.length) {
            return this._orderFunction;
        }
        this._orderFunction = o;
        return this;
    };

    DataSet.prototype.filterFunction = function(f) {
        if (!arguments.length) {
            return this._filterFunction;
        }
        this._filterFunction = f;
        return this;
    };

    DataSet.prototype.getOrderedData = function() {
        var data;

        data = this._data.sort(this._orderFunction);

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };


    DataSet.prototype.group = function(name, groupFunction, multi) {

        this.ndx = !this.ndx ? crossfilter(this._data) : this.ndx;

        var dim = new insight.Dimension(name, groupFunction, this.ndx.dimension(groupFunction), groupFunction, multi);

        var group = new insight.Grouping(dim);

        insight.Dimensions.push(dim);
        insight.Groups.push(group);

        group.preFilter = insight.chartFilterHandler.bind(insight);

        return group;
    };

    return DataSet;

})(insight);
;insight.Dimension = (function(insight) {
    /**
     * A Dimension organizes a dataset along a particular property, or variation of a property.
     * Defining a dimension with a function of:<pre><code>function(d){ return d.Surname; }</code></pre> will slice a dataset by the distinct values of the Surname property.
     * @constructor
     * @todo reimplement how Dimensions are created.  Too much is inside ChartGroup at the moment, and ChartGroup is becoming redundant and too mixed
     * @todo display function should be provided by a setter.
     * @param {String} name - The short name used to identify this dimension, and any linked dimensions sharing the same name
     * @param {function} dimension - The function used to categorize points within the dimension.
     * @param {dimension} dimension - The crossfilter dimension representing this dimension (TODO: create this inside the constructor - should be invisible)
     * @param {function} dimension - The function used to generate a displayable string for this dimension, to be used as a label or otherwise (TODO: is this the business of this constructor or even object?)
     * @param {boolean} multi - Whether or not this dimension represents a collection of possible values in each item.
     * @class
     */
    var Dimension = function Dimension(name, func, dimension, displayFunction, multi) {
        this.Dimension = dimension;
        this.Name = name;
        this.Filters = [];
        this.Function = func;
        this.multiple = multi;

        this.displayFunction = displayFunction ? displayFunction : function(d) {
            return d;
        };

        this.comparer = function(d) {
            return d.Name == this.Name;
        }.bind(this);


    };

    return Dimension;

})(insight);
;insight.Grouping = (function(insight) {

    /**
     * A Grouping is generated on a dimension, to reduce the items in the data set into groups along the provided dimension
     * @constructor
     * @param {Dimension} dimension - The dimension to group
     * @class
     */
    function Grouping(dimension) {

        this.dimension = dimension;

        var sumProperties = [];
        var countProperties = [];
        var cumulativeProperties = [];
        var averageProperties = [];

        var linkedSeries = [];

        this._compute = null;
        this.gIndices = {};

        this._valueAccessor = function(d) {
            return d;
        };

        this._orderFunction = function(a, b) {
            return b.value.Count - a.value.Count;
        };

        this.registerSeries = function(series) {
            linkedSeries.push(series);
            series.clickEvent = this.preFilter;
        };

        this.preFilter = function(series, filter, dimensionSelector) {

        };

        this._ordered = false;

        /**
         * The sum function gets or sets the properties that this group will sum across.
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names in the dataset that will be summed along this grouping's dimension
         * @returns {this}
         */
        this.sum = function(_) {
            if (!arguments.length) {
                return sumProperties;
            }
            sumProperties = _;
            return this;
        };

        /**
         * The cumulative function gets or sets the properties whose value occurences will be accumulated across this dimension.
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names that will have their occuring values accumulated after aggregation
         * @returns {this}
         */
        this.cumulative = function(_) {
            if (!arguments.length) {
                return cumulativeProperties;
            }
            cumulativeProperties = _;
            return this;
        };

        /**
         * The count function gets or sets the properties whose value occurences will be counted across this dimension.
         * If the provided property contains an array of values, each distinct value in that array will be counted.
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names that will have their occuring values counted during aggregation
         * @returns {this}
         */
        this.count = function(_) {
            if (!arguments.length) {
                return countProperties;
            }
            countProperties = _;
            return this;
        };

        /**
         * The average function gets or sets the properties whose values will be averaged for across this grouped dimension
         * @returns {String[]}
         */
        /**
         * @param {String[]} properties - An array of property names that will have be averaged during aggregation
         * @returns {this}
         */
        this.mean = function(_) {
            if (!arguments.length) {
                return averageProperties;
            }
            averageProperties = _;

            sumProperties = this.unique(sumProperties.concat(averageProperties));

            return this;
        };

        return this;
    }


    /**
     * Gets or sets whether the group's data is ordered.
     * @returns {String[]}
     */
    /**
     * @param {boolean} order - a boolean for whether to order the group's values
     * @returns {this}
     */
    Grouping.prototype.ordered = function(_) {
        if (!arguments.length) {
            return this._ordered;
        }
        this._ordered = _;

        return this;
    };

    /**
     * The filter method gets or sets the function used to filter the results returned by this grouping.
     * @param {function} filterFunction - A function taking a parameter representing an object in the list.  The function must return true or false as per <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter">Array Filter</a>.
     */
    Grouping.prototype.filter = function(f) {
        if (!arguments.length) {
            return this._filterFunction;
        }
        this._filterFunction = f;
        return this;
    };


    /**
     * A Helper function to to return the distinct elements in an array.  Used when properties to be averaged are defined, as they must also be added to the sum properties list without duplicating them.
     * @returns {array} - The input array filtered to only contain unique items
     * @param {object[]} data - An array from which to remove duplicate values
     */
    Grouping.prototype.unique = function(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i] === a[j])
                    a.splice(j--, 1);
            }
        }
        return a;
    };


    /**
     * This aggregation method is tailored to dimensions that can hold multiple values (in an array), therefore they are counted differently.
     * For example: a property called supportedDevices : ['iPhone5', 'iPhone4'] where the values inside the array are treated as dimensional slices
     * @returns {object[]} return - the array of dimensional groupings resulting from this dimensional aggregation
     */
    Grouping.prototype.reduceMultiDimension = function() {

        var propertiesToSum = this.sum();
        var propertiesToCount = this.count();
        var propertiesToAverage = this.mean();

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

        data = this.dimension.Dimension.groupAll()
            .reduce(reduceAdd, reduceRemove, reduceInitial);

        this.orderFunction(function(a, b) {
            return b.value - a.value;
        });

        return data;
    };


    /**
     * This method performs the aggregation of the underlying crossfilter dimension, calculating any additional properties during the map-reduce phase.
     * It must be run prior to a group being used
     * @todo This should probably be run during the constructor? If not, lazily evaluated by getData() if it hasn't been run already.
     */
    Grouping.prototype.initialize = function() {
        var propertiesToSum = this.sum();
        var propertiesToCount = this.count();
        var propertiesToAverage = this.mean();

        var data = [];

        if (this.dimension.multiple) {
            data = this.reduceMultiDimension();
        } else {
            data = this.dimension.Dimension.group()
                .reduce(
                    function(p, v) {
                        p.Count++;

                        for (var property in propertiesToSum) {
                            if (v.hasOwnProperty(propertiesToSum[property])) {
                                p[propertiesToSum[property]].Sum += v[propertiesToSum[property]];
                            }
                        }

                        for (var avProperty in propertiesToAverage) {
                            if (v.hasOwnProperty(propertiesToAverage[avProperty])) {
                                p[propertiesToAverage[avProperty]].Average = p[propertiesToAverage[avProperty]].Average + ((v[propertiesToAverage[avProperty]] - p[propertiesToAverage[avProperty]].Average) / p.Count);
                            }
                        }

                        for (var countProp in propertiesToCount) {
                            if (v.hasOwnProperty(propertiesToCount[countProp])) {
                                var propertyName = propertiesToCount[countProp];
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
                                var propertyName = propertiesToCount[countProp];
                                var propertyValue = v[propertiesToCount[countProp]];

                                if (insight.Utils.isArray(propertyValue)) {

                                    for (var subIndex in propertyValue) {
                                        var subVal = propertyValue[subIndex];
                                        p[propertyName][subVal] = p[propertyName].hasOwnProperty(subVal) ? p[propertyName][subVal] - 1 : 1;
                                        p[propertyName].Total--;
                                    }

                                } else {
                                    p[propertyName][propertyValue] = p[propertyName].hasOwnProperty(propertyValue) ? p[propertyName][propertyValue] - 1 : 1;
                                    p[propertyName].Total--;
                                }

                            }
                        }

                        for (var avProperty in propertiesToAverage) {
                            if (v.hasOwnProperty(propertiesToAverage[avProperty])) {
                                var valRemoved = v[propertiesToAverage[avProperty]];
                                var sum = p[propertiesToAverage[avProperty]].Sum;
                                p[propertiesToAverage[avProperty]].Average = sum / p.Count;

                                var result = p[propertiesToAverage[avProperty]].Average;

                                if (!isFinite(result)) {
                                    p[propertiesToAverage[avProperty]].Average = 0;
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
        this._data = data;

        if (this.cumulative()
            .length) {
            this.calculateTotals();
        }

        return this;
    };




    /**
     * This method is called when any post aggregation calculations, provided by the computeFunction() setter, need to be recalculated.
     * For example, calculating group percentages after totals have been created during map-reduce.
     * @param {object[]} data - The short name used to identify this dimension, and any linked dimensions sharing the same name
     */
    Grouping.prototype.recalculate = function() {
        if (this.cumulative()
            .length) {
            this.calculateTotals();
        }
        if (this._compute) {
            this._compute();
        }
    };


    /**
     * This method is used to return the group's data, without ordering.  It checks if there is any filtering requested and applies the filter to the return array.
     * @returns {object[]} return - The grouping's data in an object array, with an object per slice of the dimension.
     */
    Grouping.prototype.getData = function() {
        var data;

        if (!this._data) {
            this.initialize();
        }

        if (this.dimension.multiple) {
            data = this._data.value()
                .values;
        } else {
            data = this._data.all()
                .slice(0);
        }

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };


    /**
     * This method is used to return the group's data, with ordering applied.  It checks if there is any filtering requested and applies the filter to the return array.
     * @returns {object[]} return - The grouping's data in an object array, with an object per slice of the dimension.
     */
    Grouping.prototype.getOrderedData = function(topValues) {

        var data = [];

        if (!this._data) {
            this.initialize();
        }

        if (!this.dimension.multiple) {
            data = this._data.all()
                .slice(0)
                .sort(this.orderFunction());

            if (topValues) {
                data = data.slice(0, topValues);
            }
        } else {

            // take shallow copy of array prior to ordering so that ordering is not done in place, which would break ordering of index map. Must be better way to do this.
            data = this._data.value()
                .values
                .slice(0);

            data = data.sort(this.orderFunction());
            if (topValues) {
                data = data.slice(0, topValues);
            }
        }

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };


    /**
     * This getter/setter defines the post aggregation function that will be run once dimension map-reduce has been performed.  Used for any calculations that require the outputs of the map-reduce stage.
     * @returns {function}
     */
    /**
     * @param {function} compareFunction - A function taking two parameters, that compares them and returns a value greater than 0 then the second parameter will be lower in the ordering than the first.
     * @returns {this}
     */
    Grouping.prototype.computeFunction = function(c) {
        this._ordered = true;
        if (!arguments.length) {
            return this._compute;
        }
        this._compute = c.bind(this);
        return this;
    };


    /**
     * This method gets or sets the function used to compare the elements in this grouping if sorting is requested.  See <a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/sort">MDN</a> for examples of comparison functions.
     * @returns {this}
     * @param {function} function - The function to be run once once map-reduce has been performed.
     * @todo Auto-bind to this inside the setter?
     */
    Grouping.prototype.orderFunction = function(o) {
        if (!arguments.length) {
            return this._orderFunction;
        }
        this._orderFunction = o;
        return this;
    };

    Grouping.prototype.compute = function() {
        this._compute();
    };

    Grouping.prototype.valueAccessor = function(v) {
        if (!arguments.length) {
            return this._valueAccessor;
        }
        this._valueAccessor = v;
        return this;
    };


    Grouping.prototype.getDescendant = function(obj, desc) {
        var arr = desc.split(".");
        var name = desc;
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

    Grouping.prototype.calculateTotals = function() {

        var self = this;

        var cumulativeProperties = this.cumulative();

        if (cumulativeProperties.length) {
            var totals = {};

            var data = this._ordered ? this.getOrderedData() : this.getData();

            data
                .forEach(function(d, i) {

                    cumulativeProperties.map(function(propertyName) {

                        var desc = self.getDescendant(d.value, propertyName);

                        var totalName = desc.propertyName + 'Cumulative';

                        totals[totalName] = totals[totalName] ? totals[totalName] + desc.value : desc.value;

                        desc.container[totalName] = totals[totalName];

                    });

                });
        }
        return this;
    };

    return Grouping;

})(insight);
;(function(insight) {

    /**
     * The Chart class is the element in which series and axes are drawn
     * @class insight.Chart
     * @param {string} name - A uniquely identifying name for this chart
     * @param {string} element - The css selector identifying the div container that the chart will be drawn in. '#columnChart' for example.
     */
    insight.Chart = (function(insight) {

        function Chart(name, element) {

            this.name = name;
            this.element = element;
            this.selectedItems = [];

            var zoomAxis = null;
            this.container = null;
            this.chart = null;
            this.measureCanvas = document.createElement('canvas');

            this._margin = {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };

            var height = d3.functor(300);
            var width = d3.functor(300);
            var zoomable = false;
            var series = [];
            var axes = [];
            var self = this;
            var barPadding = d3.functor(0.1);
            var title = '';
            var autoMargin = false;


            this.init = function(create, container) {

                if (autoMargin) {
                    this.calculateLabelMargin();
                }

                this.container = create ? d3.select(container)
                    .append('div') : d3.select(this.element)
                    .append('div');

                this.container
                    .attr('class', insight.Constants.ContainerClass)
                    .style('width', this.width() + 'px')
                    .style('position', 'relative')
                    .style('display', 'inline-block');

                this.chartSVG = this.container
                    .append('svg')
                    .attr('class', insight.Constants.ChartSVG)
                    .attr('width', this.width())
                    .attr('height', this.height());

                this.chart = this.chartSVG.append('g')
                    .attr('class', insight.Constants.Chart)
                    .attr('transform', 'translate(' + this.margin()
                        .left + ',' + this.margin()
                        .top + ')');

                this.addClipPath();

                axes.map(function(axis) {
                    axis.initialize();
                });

                if (zoomable) {
                    this.initZoom();
                }

                this.tooltip();

                this.draw(false);
            };


            this.draw = function(dragging) {
                this.resizeChart();

                axes.map(function(axis) {
                    var isZoom = zoomAxis == axis;

                    if (!isZoom) {
                        axis.initializeScale();
                    }

                    axis.draw(dragging);
                });

                this.series()
                    .map(function(series) {
                        series.draw(dragging);
                    });
            };

            this.addAxis = function(axis) {
                axes.push(axis);
            };

            this.axes = function() {
                return axes;
            };

            this.addClipPath = function() {
                this.chart.append('clipPath')
                    .attr('id', this.clipPath())
                    .append('rect')
                    .attr('x', 1)
                    .attr('y', 0)
                    .attr('width', this.width() - this.margin()
                        .left - this.margin()
                        .right)
                    .attr('height', this.height() - this.margin()
                        .top - this.margin()
                        .bottom);
            };


            this.resizeChart = function() {
                this.container.style('width', this.width() + 'px');

                this.chartSVG
                    .attr('width', this.width())
                    .attr('height', this.height());

                this.chart = this.chart
                    .attr('transform', 'translate(' + this.margin()
                        .left + ',' + this.margin()
                        .top + ')');

                this.chart.select('#' + this.clipPath())
                    .append('rect')
                    .attr('x', 1)
                    .attr('y', 0)
                    .attr('width', this.width() - this.margin()
                        .left - this.margin()
                        .right)
                    .attr('height', this.height() - this.margin()
                        .top - this.margin()
                        .bottom);
            };



            this.recalculateScales = function() {
                scales.map(function(scale) {
                    // don't resize the scale that is being dragged/zoomed, it is done automatically by d3
                    var notZoomScale = zoomAxis != scale;

                    if (notZoomScale) {
                        scale.initialize();
                    }
                });
            };

            this.zoomable = function(scale) {
                zoomable = true;
                zoomAxis = scale;
                return this;
            };

            this.initZoom = function() {
                this.zoom = d3.behavior.zoom()
                    .on('zoom', self.dragging.bind(self));

                this.zoom.x(zoomAxis.scale);

                if (!this.zoomExists()) {
                    this.chart.append('rect')
                        .attr('class', 'zoompane')
                        .attr('width', this.width())
                        .attr('height', this.height() - this.margin()
                            .top - this.margin()
                            .bottom)
                        .style('fill', 'none')
                        .style('pointer-events', 'all');
                }

                this.chart.select('.zoompane')
                    .call(this.zoom);
            };

            this.zoomExists = function() {
                var z = this.chart.selectAll('.zoompane');
                return z[0].length;
            };

            this.dragging = function() {
                self.draw(true);
            };

            this.barPadding = function(_) {
                if (!arguments.length) {
                    return barPadding();
                }
                barPadding = d3.functor(_);
                return this;
            };

            this.margin = function(_) {
                if (!arguments.length) {
                    return this._margin;
                }
                this._margin = _;
                return this;
            };

            this.clipPath = function() {

                return insight.Utils.safeString(this.name) + 'clip';
            };

            this.tooltip = function() {

                this.tip = d3.tip()
                    .attr('class', 'd3-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                        return '<span class="tipvalue">' + d + '</span>';
                    });

                this.chart.call(this.tip);

                return this;
            };

            this.mouseOver = function(chart, item, d) {

                var tooltip = $(item)
                    .find('.tooltip')
                    .first()
                    .text();

                this.tip.show(tooltip);

                d3.select(item)
                    .classed('active', true);
            };

            this.mouseOut = function(chart, item, d) {
                this.tip.hide(d);

                d3.select(item)
                    .classed('active', false);
            };

            this.title = function(_) {
                if (!arguments.length) {
                    return title;
                }

                title = _;
                return this;
            };

            this.width = function(_) {
                if (!arguments.length) {
                    return width();
                }

                width = d3.functor(_);
                return this;
            };

            this.height = function(_) {
                if (!arguments.length) {
                    return height();
                }
                height = d3.functor(_);
                return this;
            };

            this.series = function(_) {
                if (!arguments.length) {
                    return series;
                }
                series = _;
                return this;
            };


            this.addHorizontalScale = function(type, typeString, direction) {
                var scale = new Scale(this, type, direction, typeString);
            };


            this.addHorizontalAxis = function(scale) {
                var axis = new Axis(this, scale, 'h', 'left');
            };


            this.autoMargin = function(_) {
                if (!arguments.length) {
                    return autoMargin;
                }
                autoMargin = _;
                return this;
            };


            this.highlight = function(selector, value) {

                var clicked = this.chart.selectAll('.' + selector);
                var alreadySelected = clicked.classed('selected');

                if (alreadySelected) {
                    clicked.classed('selected', false);
                    insight.Utils.removeItemFromArray(self.selectedItems, selector);
                } else {
                    clicked.classed('selected', true)
                        .classed('notselected', false);
                    self.selectedItems.push(selector);
                }

                var selected = this.chart.selectAll('.selected');
                var notselected = this.chart.selectAll('.bar:not(.selected),.bubble:not(.selected)');

                notselected.classed('notselected', selected[0].length > 0);
            };

            insight.addChart(this);
        }



        Chart.prototype.calculateLabelMargin = function() {

            var canvas = this.measureCanvas;
            var max = 0;

            this.series()
                .forEach(function(series) {
                    var m = series.maxLabelDimensions(canvas);
                    max = m > max ? m : max;
                });

            this.margin()
                .bottom = max;
        };

        return Chart;

    })(insight);
})(insight);
;/**
 * The Axis class coordinates the domain of the series data and draws axes on the chart in the required orientation and position.
 * @class insight.Axis
 * @param {Chart} chart - The parent chart object
 * @param {string} name - A uniquely identifying name for this chart
 * @param {string} orientation - horizontal 'h' or vertical 'v'
 * @param {insight.Scales.Scale} scale - insight.Scale.Linear for example
 * @param {string} anchor - 'left/right/top/bottom'
 */
insight.Axis = function Axis(chart, name, direction, scale, anchor) {

    this.chart = chart;
    this.scaleType = scale.name;
    this.scale = scale.scale();
    this.anchor = anchor ? anchor : 'left';
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.rangeRound;
    this.bounds = [];
    this.direction = direction;
    this.series = [];

    var self = this;
    var label = name;
    var ordered = d3.functor(false);
    var tickSize = d3.functor(0);
    var tickPadding = d3.functor(10);
    var labelRotation = '90';
    var tickOrientation = d3.functor('lr');
    var orientation = direction == 'h' ? d3.functor(this.anchor) : d3.functor(this.anchor);
    var textAnchor;
    var showGridLines = false;
    var gridlines = [];

    this.chart.addAxis(this);

    if (direction == 'v') {
        textAnchor = this.anchor == 'left' ? 'end' : 'start';
    }
    if (direction == 'h') {
        textAnchor = 'start';
    }

    // private functions

    /**
     * The default axis tick format, just returns the input
     * @returns {object} tickPoint - The axis data for a particular tick
     * @param {object} ticklabel - The output string to be displayed
     */
    var format = function(d) {
        return d;
    };

    /**
     * This method calculates the scale ranges for this axis, given a range type function and using the calculated output bounds for this axis.
     * @param {rangeType} rangeType - a d3 range function, which can either be in bands (for columns) or a continuous range
     */
    var applyScaleRange = function(rangeType) {
        self.bounds = self.calculateBounds();

        rangeType.apply(this, [
            self.bounds, self.chart.barPadding()
        ]);
    };

    /**
     * For an ordinal/categorical axis, this method queries all series that use this axis to get the list of available values
     * TODO - currently just checks the first as I've not had a scenario where different series on the same axis had different ordinal keys.
     * @returns {object[]} values - the values for this ordinal axis
     */
    var findOrdinalValues = function() {
        var vals = [];

        self.series.map(function(series) {
            vals = series.keys();
        });

        return vals;
    };

    /**
     * For linear series, this method is used to calculate the maximum value to be used in this axis.
     * @returns {Date} max - The largest value in the datasets that use this axis
     */
    var findMax = function() {
        var max = 0;

        self.series.map(function(series) {
            var m = series.findMax(self);

            max = m > max ? m : max;
        });

        return max;
    };


    /**
     * For time series, this method is used to calculate the minimum value to be used in this axis.
     * @returns {Date} minTime - The smallest time in the datasets that use this axis
     */
    var minTime = function() {
        // start at the largest time, and work back from there to find the minimum
        var minTime = new Date(8640000000000000);

        self.series.map(function(series) {
            var cMin = d3.min(series.keys());
            minTime = cMin < minTime ? cMin : minTime;
        });
        return minTime;
    };


    /**
     * For time series, this method is used to calculate the maximum value to be used in this axis.
     * @returns {Date} minTime - The largest time in the datasets that use this axis
     */
    var maxTime = function() {
        // start at the smallest time, and work back from there to find the minimum
        var maxTime = new Date(-8640000000000000);

        self.series.map(function(series) {
            var cMax = d3.max(series.keys());
            maxTime = cMax > maxTime ? cMax : maxTime;
        });

        return maxTime;
    };


    // public functions 


    this.horizontal = function() {
        return this.direction == 'h';
    };

    this.vertical = function() {
        return this.direction == 'v';
    };

    this.ordered = function(value) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(value);
        return this;
    };


    this.addSeries = function(series) {
        this.series.push(series);
    };


    // scale domain and output range methods


    /**
     * This method calculates the domain of values that this axis has, from a minimum to a maximum.
     * @memberof insight.Axis
     * @returns {object[]} bounds - An array with two items, for the lower and upper range of this axis
     */
    this.domain = function() {
        var domain = [];

        if (this.scaleType == insight.Scales.Linear.name) {
            domain = [0, findMax()];
        } else if (this.scaleType == insight.Scales.Ordinal.name) {
            domain = findOrdinalValues();
        } else if (this.scaleType == insight.Scales.Time.name) {
            domain = [minTime(), maxTime()];
        }

        return domain;
    };


    /**
     * This method calculates the output range bound of this axis, taking into account the size and margins of the chart.
     * @memberof insight.Axis
     * @returns {int[]} bounds - An array with two items, for the lower and upper bound of this axis
     */
    this.calculateBounds = function() {
        var bounds = [];

        if (self.horizontal()) {
            bounds[0] = 0;
            bounds[1] = self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
        } else if (self.vertical()) {
            bounds[0] = self.chart.height() - self.chart.margin()
                .top - self.chart.margin()
                .bottom;
            bounds[1] = 0;

        }
        return bounds;
    };



    // label and axis tick methods

    this.label = function(value) {
        if (!arguments.length) {
            return label;
        }
        label = value;
        return this;
    };


    this.labelFormat = function(value) {
        if (!arguments.length) {
            return format;
        }
        format = value;
        return this;
    };


    this.orientation = function(value) {
        if (!arguments.length) {
            return orientation();
        }
        orientation = d3.functor(value);
        return this;
    };


    this.tickRotation = function(value) {
        if (!arguments.length) {
            return labelRotation;
        }
        labelRotation = value;
        return this;
    };


    this.tickSize = function(value) {
        if (!arguments.length) {
            return tickSize();
        }
        tickSize = d3.functor(value);
        return this;
    };


    this.tickPadding = function(value) {
        if (!arguments.length) {
            return tickPadding();
        }
        tickPadding = d3.functor(value);
        return this;
    };


    this.textAnchor = function(value) {
        if (!arguments.length) {
            return textAnchor;
        }
        textAnchor = value;
        return this;
    };



    this.tickOrientation = function(value) {
        if (!arguments.length) {
            return tickOrientation();
        }

        tickOrientation = d3.functor(value);

        return this;
    };


    /**
     * This method gets/sets the rotation angle used for horizontal axis labels.  Defaults to 90 degrees
     * @memberof insight.Axis
     * @returns {object} return - Description
     * @param {object[]} data - Description
     */
    this.tickRotationTransform = function() {
        var offset = self.tickPadding() + (self.tickSize() * 2);
        offset = self.anchor == 'top' ? 0 - offset : offset;

        var rotation = this.tickOrientation() == 'tb' ? ' rotate(' + self.tickRotation() + ',0,' + offset + ')' : '';

        return rotation;
    };


    this.axisPosition = function() {
        var transform = 'translate(';

        if (self.horizontal()) {
            var transX = 0;
            var transY = self.anchor == 'top' ? 0 : (self.chart.height() - self.chart.margin()
                .bottom - self.chart.margin()
                .top);

            transform += transX + ',' + transY + ')';

        } else if (self.vertical()) {
            var xShift = self.anchor == 'left' ? 0 : self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
            transform += xShift + ',0)';
        }

        return transform;
    };


    /**
     * This method positions the text label for the axis (not the tick labels)
     * @memberof insight.Axis
     */
    this.positionLabel = function() {

        if (self.horizontal()) {
            this.labelElement.style('left', 0)
                .style(self.anchor, 0)
                .style('width', '100%')
                .style('text-align', 'center');
        } else if (self.vertical()) {
            this.labelElement.style(self.anchor, '0')
                .style('top', '35%');
        }
    };


    this.gridlines = function(value) {
        if (!arguments.length) {
            return gridlines();
        }
        showGridLines = true;
        gridlines = value;

        return this;
    };


    this.drawGridLines = function() {

        var ticks = this.scale.ticks(5);

        this.chart.chart.selectAll('line.horizontalGrid')
            .data(ticks)
            .enter()
            .append('line')
            .attr({
                'class': 'horizontalGrid',
                'x1': 0,
                'x2': chart.width(),
                'y1': function(d) {
                    return self.scale.scale(d);
                },
                'y2': function(d) {
                    return self.scale.scale(d);
                },
                'fill': 'none',
                'shape-rendering': 'crispEdges',
                'stroke': 'silver',
                'stroke-width': '1px'
            });

    };


    this.initializeScale = function() {
        applyScaleRange.call(this.scale.domain(this.domain()), this.rangeType);

    };


    this.initialize = function() {

        this.initializeScale();

        this.axis = d3.svg.axis()
            .scale(this.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.labelFormat());

        this.axisElement = this.chart.chart.append('g');

        this.axisElement
            .attr('class', insight.Constants.AxisClass)
            .attr('transform', self.axisPosition())
            .call(this.axis)
            .selectAll('text')
            .attr('class', insight.Constants.AxisTextClass)
            .style('text-anchor', self.textAnchor())
            .style('transform', self.tickRotationTransform());

        this.labelElement = this.chart.container
            .append('div')
            .attr('class', insight.Constants.AxisLabelClass)
            .style('position', 'absolute')
            .text(this.label());

        this.positionLabel();
    };



    this.draw = function(dragging) {

        this.axis = d3.svg.axis()
            .scale(this.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.labelFormat());

        this.axisElement
            .transition()
            .duration(500)
            .attr('transform', self.axisPosition())
            .call(this.axis);

        this.axisElement
            .selectAll('text')
            .attr('transform', self.tickRotationTransform())
            .style('text-anchor', self.textAnchor());

        this.labelElement
            .text(this.label());

        if (showGridLines) {
            // commented out as it's not quite working yet but should just need tweaking
            //this.drawGridLines(); 
        }
    };
};
;/**
 * The Series base class provides some base functions that are used by any specific types of series that derive from this class
 * @class insight.Series
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.Series = function Series(name, chart, data, x, y, color) {

    this.chart = chart;
    this.data = data;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = d3.functor(color);
    this.animationDuration = 300;
    this.topValues = null;
    this.dimensionName = data.dimension ? data.dimension.Name + "Dim" : "";
    x.addSeries(this);
    y.addSeries(this);

    if (data.registerSeries) {
        data.registerSeries(this);
    }

    var self = this;
    var cssClass = "";

    var filter = null;

    // private functions used internally, set by functions below that are exposed on the object

    var keyFunction = function(d) {
        return d.key;
    };

    var valueFunction = function(d) {
        return d.value;
    };

    var xFunction = function(d) {
        return d.key;
    };


    var tooltipFormat = function(d) {
        return d;
    };

    var tooltipAccessor = function(d) {
        return valueFunction(d);
    };

    var tooltipFunction = function(d) {
        return tooltipFormat(tooltipAccessor(d));
    };

    this.keyFunction = function(_) {
        if (!arguments.length) {
            return keyFunction;
        }
        keyFunction = _;

        return this;
    };

    this.valueFunction = function(_) {
        if (!arguments.length) {
            return valueFunction;
        }
        valueFunction = _;

        return this;
    };

    this.dataset = function() {
        //won't always be x that determines this (rowcharts, bullets etc.), need concept of ordering by data scale?

        var data = this.x.ordered() ? this.data.getOrderedData(this.topValues) : this.data.getData();

        if (filter) {
            data = data.filter(filter);
        }

        return data;
    };

    this.keys = function() {
        return this.dataset()
            .map(self.keyFunction());
    };

    this.cssClass = function(_) {
        if (!arguments.length) {
            return cssClass;
        }
        cssClass = _;
        return this;
    };

    this.keyAccessor = function(d) {
        return d.key;
    };

    this.xFunction = function(_) {
        if (!arguments.length) {
            return xFunction;
        }
        xFunction = _;

        return this;
    };


    this.mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);
    };

    this.mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };

    /**
     * This function takes a data point, and creates a class name for insight to identify this particular key
     * If the parameter is not an object (just a value in an array) then there is no need for this particular class so blank is returned.
     * @memberof insight.Series
     * @returns {string} return - A class name to identify this point and any other points taking the same value in other charts.
     * @param {object} data - The input point
     */
    this.sliceSelector = function(d) {

        var str = d.key.toString();

        var result = "in_" + str.replace(/[^A-Z0-9]/ig, "_");

        return result;
    };


    this.selectedClassName = function(name) {
        var selected = "";

        if (self.chart.selectedItems.length) {
            selected = self.chart.selectedItems.indexOf(name) > -1 ? "selected" : "notselected";
        }

        return selected;
    };


    this.click = function(element, filter) {

        var selector = self.sliceSelector(filter);

        this.clickEvent(this, filter, selector);
    };

    this.filterFunction = function(_) {
        if (!arguments.length) {
            return filter;
        }
        filter = _;

        return this;
    };

    this.tooltipFormat = function(_) {
        if (!arguments.length) {
            return tooltipFormat;
        }
        tooltipFormat = _;

        return this;
    };

    this.tooltipFunction = function(_) {
        if (!arguments.length) {
            return tooltipFunction;
        }
        tooltipFunction = _;

        return this;
    };

    this.top = function(_) {
        if (!arguments.length) {
            return this.topValues;
        }
        this.topValues = _;

        return this;
    };

    this.maxLabelDimensions = function(measureCanvas) {

        var sampleText = document.createElement('div');
        sampleText.setAttribute('class', insight.Constants.AxisTextClass);
        var style = window.getComputedStyle(sampleText);
        var ctx = measureCanvas.getContext('2d');
        ctx.font = style['font-size'] + ' ' + style['font-family'];

        var max = 0;

        this.keys()
            .forEach(function(key) {

                var width = ctx.measureText(key)
                    .width;

                max = width > max ? width : max;
            });

        return max;
    };


    this.findMax = function(scale) {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.keyFunction() : self.valueFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };

    this.draw = function() {};

    return this;
};

/* Skeleton event overriden by a Dashboard to subscribe to this series' clicks.
 * @param {object} series - The series being clicked
 * @param {object[]} filter - The value of the point selected, used for filtering/highlighting
 * @param {object[]} selection - The css selection name also used to maintain a list of filtered dimensions (TODO - is this needed anymore?)
 */
insight.Series.prototype.clickEvent = function(series, filter, selection) {

};
;/**
 * The MarkerSeries class extends the Series class and draws markers/targets on a chart
 * @class insight.MarkerSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.MarkerSeries = function MarkerSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var thickness = 5;

    var widthFactor = 1;
    var offset = 0;

    var horizontal = false;
    var vertical = true;

    this.xPosition = function(d) {
        var pos = 0;

        if (vertical) {
            pos = self.x.scale(self.keyFunction()(d));

            if (!offset) {
                offset = self.calculateOffset(d);
            }

            pos = widthFactor != 1 ? pos + offset : pos;
        } else {
            pos = self.x.scale(self.valueFunction()(d));

        }

        return pos;
    };


    this.keys = function() {

        var f = self.keyFunction();

        return self.dataset()
            .map(f);
    };

    this.calculateOffset = function(d) {

        var thickness = horizontal ? self.markerHeight(d) : self.markerWidth(d);
        var scalePos = horizontal ? self.y.scale.rangeBand(d) : self.x.scale.rangeBand(d);

        return (scalePos - thickness) * 0.5;
    };

    this.yPosition = function(d) {

        var position = 0;

        if (horizontal) {
            position = self.y.scale(self.keyFunction()(d));

            if (!offset) {
                offset = self.calculateOffset(d);
            }

            position = widthFactor != 1 ? position + offset : position;

        } else {
            position = self.y.scale(self.valueFunction()(d));
        }

        return position;
    };

    this.horizontal = function() {
        horizontal = true;
        vertical = false;

        return this;
    };

    this.vertical = function() {
        vertical = true;
        horizontal = false;
        return this;
    };

    this.widthFactor = function(_) {

        if (!arguments.length) {
            return widthFactor;
        }
        widthFactor = _;
        return this;
    };

    this.thickness = function(_) {
        if (!arguments.length) {
            return thickness;
        }
        thickness = _;
        return this;
    };

    this.markerWidth = function(d) {
        var w = 0;

        if (horizontal) {
            w = self.thickness();
        } else {
            w = self.x.scale.rangeBand(d) * widthFactor;
        }

        return w;
    };

    this.markerHeight = function(d) {
        var h = 0;

        if (horizontal) {
            h = self.y.scale.rangeBand(d) * widthFactor;
        } else {
            h = self.thickness();
        }

        return h;
    };



    this.className = function(d) {
        var dimension = self.sliceSelector(d);

        var selected = self.selectedClassName(dimension);

        return self.name + 'class bar ' + dimension + " " + selected + " " + self.dimensionName;
    };



    this.draw = function(drag) {

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var d = this.dataset()
            .forEach(reset);

        var groups = this.chart.chart
            .selectAll('g.' + insight.Constants.BarGroupClass + "." + this.name)
            .data(this.dataset(), this.keyAccessor);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', insight.Constants.BarGroupClass + " " + this.name);

        var newBars = newGroups.selectAll('rect.bar');

        var click = function(filter) {
            return self.click(this, filter);
        };

        var duration = function(d, i) {
            return 200 + (i * 20);
        };

        newBars = newGroups.append('rect')
            .attr('class', self.className)
            .attr('y', this.y.bounds[0])
            .attr('height', 0)
            .attr('fill', this.color)
            .attr('clip-path', 'url(#' + this.chart.clipPath() + ')')
            .on('mouseover', this.mouseOver)
            .on('mouseout', this.mouseOut)
            .on('click', click);

        newBars.append('svg:text')
            .attr('class', insight.Constants.ToolTipTextClass);

        var bars = groups.selectAll('.' + this.name + 'class.bar');

        bars
            .transition()
            .duration(duration)
            .attr('y', this.yPosition)
            .attr('x', this.xPosition)
            .attr('width', this.markerWidth)
            .attr('height', this.markerHeight);

        bars.selectAll('.' + insight.Constants.ToolTipTextClass)
            .text(this.tooltipFunction());

        groups.exit()
            .remove();
    };

    return this;
};

insight.MarkerSeries.prototype = Object.create(insight.Series.prototype);
insight.MarkerSeries.prototype.constructor = insight.MarkerSeries;
;/**
 * The BubbleSeries class extends the Series class
 * @class insight.BubbleSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.BubbleSeries = function BubbleSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var radiusFunction = d3.functor(10);
    var fillFunction = d3.functor(color);
    var maxRad = d3.functor(50);
    var minRad = d3.functor(7);
    var tooltipExists = false;
    var self = this;
    var selector = this.name + insight.Constants.Bubble;

    var xFunction = function(d) {};
    var yFunction = function(d) {};


    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);

        d3.select(this)
            .classed("hover", true);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };




    this.findMax = function(scale) {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };

    this.yFunction = function(_) {
        if (!arguments.length) {
            return yFunction;
        }
        yFunction = _;

        return this;

    };


    this.xFunction = function(_) {
        if (!arguments.length) {
            return xFunction;
        }
        xFunction = _;

        return this;

    };

    this.rangeY = function(d) {
        var f = self.yFunction();

        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i) {
        var f = self.xFunction();
        return self.x.scale(self.xFunction()(d));
    };

    this.radiusFunction = function(_) {
        if (!arguments.length) {
            return radiusFunction;
        }
        radiusFunction = _;

        return this;
    };


    var className = function(d) {

        return selector + " " + insight.Constants.Bubble + " " + self.sliceSelector(d) + " " + self.dimensionName;
    };

    this.fillFunction = function(_) {
        if (!arguments.length) {
            return fillFunction;
        }
        fillFunction = _;

        return this;
    };



    this.draw = function(drag) {
        var duration = drag ? 0 : function(d, i) {
            return 200 + (i * 20);
        };

        var data = this.dataset();

        var min = d3.min(data, radiusFunction);
        var max = d3.max(data, radiusFunction);

        var rad = function(d) {
            return d.radius;
        };

        var click = function(filter) {
            return self.click(this, filter);
        };

        // create radius for each item
        data.forEach(function(d) {
            var radiusInput = radiusFunction(d);

            d.radius = minRad() + (((radiusInput - min) * (maxRad() - minRad())) / (max - min));
        });

        //this sort ensures that smaller bubbles are on top of larger ones, so that they are always selectable.  Without changing original array (hence concat which creates a copy)
        data = data.concat()
            .sort(function(a, b) {
                return d3.descending(rad(a), rad(b));
            });

        var bubbles = this.chart.chart.selectAll('circle.' + selector)
            .data(data, self.keyAccessor);

        bubbles.enter()
            .append('circle')
            .attr('class', className)
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut)
            .on('click', click);

        bubbles.transition()
            .duration(duration)
            .attr('r', rad)
            .attr('cx', self.rangeX)
            .attr('cy', self.rangeY)
            .attr('fill', fillFunction);

        if (!tooltipExists) {
            bubbles.append('svg:text')
                .attr('class', insight.Constants.ToolTipTextClass);
            tooltipExists = true;
        }

        bubbles.selectAll("." + insight.Constants.ToolTipTextClass)
            .text(this.tooltipFunction());
    };
};

insight.BubbleSeries.prototype = Object.create(insight.Series.prototype);
insight.BubbleSeries.prototype.constructor = insight.BubbleSeries;
;/**
 * The RowSeries class extends the Series class and draws horizontal bars on a Chart
 * @class insight.RowSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.RowSeries = function RowSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var stacked = d3.functor(false);
    var seriesName = "";
    var tooltipExists = false;

    var tooltipFunction = function(d) {
        var func = self.series[self.currentSeries].accessor;
        return self.tooltipFormat()(func(d));
    };


    this.series = [{
        name: 'default',
        accessor: function(d) {
            return self.valueFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor(color),
        label: 'Value'
    }];


    /**
     * RowSeries overrides the standard key function used by most, vertical charts.
     * @memberof insight.RowSeries
     * @returns {object[]} return - The keys along the domain axis for this row series
     */
    this.keys = function() {
        return self.dataset()
            .map(self.keyFunction());
    };


    /**
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
     * @memberof insight.RowSeries
     * @returns {Number} return - Description
     * @param {object} data - An item in the object array to query
     */
    this.seriesMax = function(d) {
        var max = 0;
        var seriesMax = 0;

        var stacked = self.stacked();

        for (var series in self.series) {
            var s = self.series[series];

            var seriesValue = s.accessor(d);

            seriesMax = stacked ? seriesMax + seriesValue : seriesValue;

            max = seriesMax > max ? seriesMax : max;
        }

        return max;
    };


    /**
     * This method returns the largest value on the value axis of this ColumnSeries, checking all series functions in the series on all points.
     * This function is mapped across the entire data array by the findMax method.
     * @memberof insight.RowSeries
     * @returns {Number} return - The largest value on the value scale of this ColumnSeries
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * This method gets or sets whether or not the series in this ColumnSeries are to be stacked or not.  This is false by default.
     * @memberof insight.RowSeries
     * @returns {boolean} - Whether or not the columns are stacked (they are grouped if this returns false)
     */
    /**
     * @memberof insight.RowSeries
     * @returns {object} return - Description
     * @param {boolean} stack - To stack or not to stack
     */
    this.stacked = function(_) {
        if (!arguments.length) {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.calculateXPos = function(func, d) {
        if (!d.xPos) {
            d.xPos = 0;
        }
        var myPosition = d.xPos;

        d.xPos += func(d);

        return myPosition;
    };

    this.yPosition = function(d) {
        return self.y.scale(self.keyFunction()(d));
    };

    this.calculateYPos = function(thickness, d) {
        if (!d.yPos) {
            d.yPos = self.yPosition(d);
        } else {
            d.yPos += thickness;
        }
        return d.yPos;
    };

    this.xPosition = function(d) {

        var func = self.series[self.currentSeries].accessor;

        var position = self.stacked() ? self.x.scale(self.calculateXPos(func, d)) : 0;

        return position;
    };

    this.barThickness = function(d) {
        return self.y.scale.rangeBand(d);
    };

    this.groupedbarThickness = function(d) {

        var groupThickness = self.barThickness(d);

        var width = self.stacked() || (self.series.length == 1) ? groupThickness : groupThickness / self.series.length;

        return width;
    };

    this.offsetYPosition = function(d) {
        var thickness = self.groupedbarThickness(d);
        var position = self.stacked() ? self.yPosition(d) : self.calculateYPos(thickness, d);

        return position;
    };

    this.barWidth = function(d) {
        var func = self.series[self.currentSeries].accessor;

        return self.x.scale(func(d));
    };

    this.className = function(d) {
        return seriesName + 'class bar ' + self.sliceSelector(d);
    };

    this.draw = function(drag) {
        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var groups = this.chart.chart
            .selectAll('g.' + insight.Constants.BarGroupClass + "." + this.name)
            .data(this.dataset(), this.keyAccessor)
            .each(reset);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', insight.Constants.BarGroupClass + " " + this.name);

        var newBars = newGroups.selectAll('rect.bar');

        var click = function(filter) {
            return self.click(this, filter);
        };

        var duration = function(d, i) {
            return 200 + (i * 20);
        };

        for (var ser in this.series) {

            this.currentSeries = ser;

            var s = this.series[ser];

            seriesName = s.name;

            newBars = newGroups.append('rect')
                .attr('class', self.className)
                .attr('height', 0)
                .attr('fill', s.color)
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .on('mouseover', this.mouseOver)
                .on('mouseout', this.mouseOut)
                .on('click', click);


            newBars.append('svg:text')
                .attr('class', insight.Constants.ToolTipTextClass);

            var bars = groups.selectAll('.' + seriesName + 'class.bar')
                .transition()
                .duration(duration)
                .attr('y', this.offsetYPosition)
                .attr('x', this.xPosition)
                .attr('height', this.groupedbarThickness)
                .attr('width', this.barWidth);

            bars.selectAll("." + insight.Constants.ToolTipTextClass)
                .text(tooltipFunction);
        }
    };

    return this;
};


insight.RowSeries.prototype = Object.create(insight.Series.prototype);
insight.RowSeries.prototype.constructor = insight.RowSeries;
;/**
 * The LineSeries class extends the Series class and draws horizontal bars on a Chart
 * @class insight.LineSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.LineSeries = function LineSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var self = this;

    var lineType = 'linear';
    var tooltipExists = false;

    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);

        d3.select(this)
            .classed("hover", true);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };

    var lineOver = function(d, item) {

    };

    var lineOut = function(d, item) {

    };

    var lineClick = function(d, item) {

    };

    this.rangeY = function(d) {
        return self.y.scale(self.valueFunction()(d));
    };

    this.rangeX = function(d, i) {
        var val = 0;

        if (self.x.scale.rangeBand) {
            val = self.x.scale(self.keyFunction()(d)) + (self.x.scale.rangeBand() / 2);
        } else {

            val = self.x.scale(self.keyFunction()(d));
        }

        return val;
    };

    this.lineType = function(_) {
        if (!arguments.length) {
            return lineType;
        }
        lineType = _;
        return this;
    };

    this.draw = function(dragging) {
        var transform = d3.svg.line()
            .x(self.rangeX)
            .y(self.rangeY)
            .interpolate(lineType);

        var data = this.dataset();

        var rangeIdentifier = "path." + this.name + ".in-line";

        var rangeElement = this.chart.chart.selectAll(rangeIdentifier);

        if (!this.rangeExists(rangeElement)) {
            this.chart.chart.append("path")
                .attr("class", this.name + " in-line")
                .attr("stroke", this.color)
                .attr("fill", "none")
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .on('mouseover', lineOver)
                .on('mouseout', lineOut)
                .on('click', lineClick);
        }

        var duration = dragging ? 0 : function(d, i) {
            return 300 + i * 20;
        };

        this.chart.chart.selectAll(rangeIdentifier)
            .datum(this.dataset(), this.matcher)
            .transition()
            .duration(duration)
            .attr("d", transform);

        var circles = this.chart.chart.selectAll("circle")
            .data(this.dataset());

        circles.enter()
            .append('circle')
            .attr('class', 'target-point')
            .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
            .attr("cx", self.rangeX)
            .attr("cy", self.chart.height() - self.chart.margin()
                .bottom - self.chart.margin()
                .top)
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut);


        circles
            .transition()
            .duration(duration)
            .attr("cx", self.rangeX)
            .attr("cy", self.rangeY)
            .attr("r", 2.5);


        if (!tooltipExists) {
            circles.append('svg:text')
                .attr('class', insight.Constants.ToolTipTextClass);
            tooltipExists = true;
        }

        circles.selectAll("." + insight.Constants.ToolTipTextClass)
            .text(this.tooltipFunction());
    };

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };
};

insight.LineSeries.prototype = Object.create(insight.Series.prototype);
insight.LineSeries.prototype.constructor = insight.LineSeries;
;/**
 * The ColumnSeries class extends the Series class and draws vertical bars on a Chart
 * @class insight.ColumnSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {Chart} chart - The parent chart object
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.ColumnSeries = function ColumnSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var stacked = d3.functor(false);
    var seriesName = "";
    var barWidthFunction = this.x.rangeType;


    var tooltipFunction = function(d) {
        var func = self.series[self.currentSeries].accessor;
        return self.tooltipFormat()(func(d));
    };


    this.series = [{
        name: 'default',
        accessor: function(d) {
            return self.valueFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor(color),
        label: 'Value'
    }];


    /**
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
     * @public
     * @returns {Number} return - Description
     * @param {object} data - An item in the object array to query
     */
    this.seriesMax = function(d) {
        var max = 0;
        var seriesMax = 0;

        var stacked = self.stacked();

        for (var series in self.series) {
            var s = self.series[series];

            var seriesValue = s.accessor(d);

            seriesMax = stacked ? seriesMax + seriesValue : seriesValue;

            max = seriesMax > max ? seriesMax : max;
        }

        return max;
    };


    /**
     * This method returns the largest value on the value axis of this ColumnSeries, checking all series functions in the series on all points.
     * This function is mapped across the entire data array by the findMax method.
     * @memberof insight.ColumnSeries
     * @returns {Number} return - The largest value on the value scale of this ColumnSeries
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * This method gets or sets whether or not the series in this ColumnSeries are to be stacked or not.  This is false by default.
     * @memberof insight.ColumnSeries
     * @returns {boolean} - Whether or not the columns are stacked (they are grouped if this returns false)
     */
    /**
     * @memberof insight.ColumnSeries
     * @returns {object} return - Description
     * @param {boolean} stack - To stack or not to stack
     */
    this.stacked = function(_) {
        if (!arguments.length) {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };

    this.xPosition = function(d) {
        return self.x.scale(self.keyFunction()(d));
    };

    this.calculateXPos = function(width, d) {
        if (!d.xPos) {
            d.xPos = self.xPosition(d);
        } else {
            d.xPos += width;
        }
        return d.xPos;
    };

    this.yPosition = function(d) {

        var func = self.series[self.currentSeries].accessor;

        var position = self.stackedBars() ? self.y.scale(self.calculateYPos(func, d)) : self.y.scale(func(d));

        return position;
    };



    this.barWidth = function(d) {
        // comment for tom, this is the bit that is currently breaking the linear x axis, because d3 linear scales don't support the rangeBand() function, whereas ordinal ones do.
        // in js, you can separate the scale and range function using rangeBandFunction.call(self.x.scale, d), where rangeBandFunction can point to the appropriate function for the type of scale being used.
        return self.x.scale.rangeBand(d);
    };

    this.groupedBarWidth = function(d) {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series.length == 1) ? groupWidth : groupWidth / self.series.length;

        return width;
    };

    this.offsetXPosition = function(d) {
        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.barHeight = function(d) {
        var func = self.series[self.currentSeries].accessor;

        return (self.chart.height() - self.chart.margin()
            .top - self.chart.margin()
            .bottom) - self.y.scale(func(d));
    };

    this.stackedBars = function() {
        return self.stacked();
    };



    this.className = function(d) {
        var dimension = self.sliceSelector(d);

        var selected = self.selectedClassName(dimension);

        return seriesName + 'class bar ' + dimension + " " + selected + " " + self.dimensionName;
    };

    var click = function(filter) {
        return self.click(this, filter);
    };

    var duration = function(d, i) {
        return 200 + (i * 20);
    };

    this.draw = function(drag) {

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var d = this.dataset()
            .forEach(reset);

        var groups = this.chart.chart
            .selectAll('g.' + insight.Constants.BarGroupClass)
            .data(this.dataset(), this.keyAccessor);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', insight.Constants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        for (var ser in this.series) {

            this.currentSeries = ser;

            var s = this.series[ser];

            seriesName = s.name;

            newBars = newGroups.append('rect')
                .attr('class', self.className)
                .attr('y', this.y.bounds[0])
                .attr('height', 0)
                .attr('fill', s.color)
                .attr('clip-path', 'url(#' + this.chart.clipPath() + ')')
                .on('mouseover', this.mouseOver)
                .on('mouseout', this.mouseOut)
                .on('click', click);

            newBars.append('svg:text')
                .attr('class', insight.Constants.ToolTipTextClass);

            var bars = groups.selectAll('.' + seriesName + 'class.bar');

            bars
                .transition()
                .duration(duration)
                .attr('y', this.yPosition)
                .attr('x', this.offsetXPosition)
                .attr('width', this.groupedBarWidth)
                .attr('height', this.barHeight);

            bars.selectAll('.' + insight.Constants.ToolTipTextClass)
                .text(tooltipFunction);

        }

        groups.exit()
            .remove();
    };

    return this;
};

insight.ColumnSeries.prototype = Object.create(insight.Series.prototype);
insight.ColumnSeries.prototype.constructor = insight.ColumnSeries;
