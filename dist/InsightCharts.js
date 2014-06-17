var InsightConstants = (function() {
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
;var InsightFormatters = (function(d3) {
    var exports = {};


    exports.moduleProperty = 1;

    exports.currencyFormatter = function(value) {
        var format = d3.format(",f");
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
var InsightUtils = (function() {

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

    return exports;
}());
;var Dashboard = function Dashboard(name) {
    this.Name = name;
    this.Charts = [];
    this.Dimensions = [];
    this.FilteredDimensions = [];
    this.Groups = [];
    this.ComputedGroups = [];
    this.LinkedCharts = [];
    this.NestedGroups = [];
};

Dashboard.prototype.initCharts = function() {
    this.Charts
        .forEach(
            function(chart) {
                chart.init();
            });
};

Dashboard.prototype.addChart = function(chart) {

    chart.filterEvent = this.chartFilterHandler.bind(this);
    chart.triggerRedraw = this.redrawCharts.bind(this);

    this.Charts.push(chart);

    return chart;
};

Dashboard.prototype.addDimension = function(ndx, name, func, displayFunc, multi) {
    var dimension = new Dimension(name, func, ndx.dimension(func), displayFunc, multi);

    this.Dimensions.push(dimension);

    return dimension;
};

Dashboard.prototype.compareFilters = function(filterFunction) {
    return function(d) {
        return String(d.name) == String(filterFunction.name);
    };
};

Dashboard.prototype.chartFilterHandler = function(dimension, filterFunction) {
    var self = this;

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
                self.removeMatchesFromArray(dim.Filters, comparerFunction);

            } else {
                // add the provided filter to the list for this dimension

                dim.Filters.push(filterFunction);
            }

            // reset this dimension if no filters exist, else apply the filter to the dataset.
            if (dim.Filters.length === 0) {

                self.removeItemFromArray(self.FilteredDimensions, dim);
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
                        .length;
                });
            }
        });

        this.Groups.forEach(function(group) {
            group.recalculate();

        });

        // recalculate non standard groups
        this.NestedGroups
            .forEach(
                function(group) {
                    group.updateNestedData();
                }
        );

        this.ComputedGroups
            .forEach(
                function(group) {
                    group.compute();
                }
        );

        this.redrawCharts();
    }
};



Dashboard.prototype.redrawCharts = function() {
    for (var i = 0; i < this.Charts
        .length; i++) {
        this.Charts[i].draw();
    }
};
;/**
 * A DataSet is wrapper around a simple object array, but providing some functions that are required by charts to load and filter data.
 * A DataSet should be used with an array of data that is to be charted without being used in a crossfilter or dimensional dataset.
 * @constructor
 * @param {object[]} data - The short name used to identify this dimension, and any linked dimensions sharing the same name
 */
function DataSet(data) {

    this._data = data;

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
;/**
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
;function Group(data) {
    this._data = data;
    this._cumulative = false;

    this._valueAccessor = function(d) {
        return d;
    };

    this._orderFunction = function(a, b) {
        return b.value - a.value;
    };

    this._ordered = false;
}

Group.prototype.filterFunction = function(f) {
    if (!arguments.length) {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Group.prototype.cumulative = function(c) {
    if (!arguments.length) {
        return this._cumulative;
    }
    this._cumulative = c;
    return this;
};

Group.prototype.getData = function() {
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

Group.prototype.getOrderedData = function() {
    var data;

    if (this._data.all) {
        data = data = this._data.top(Infinity)
            .sort(this.orderFunction());
    } else {
        data = this._data.sort(this.orderFunction());
    }

    if (this._filterFunction) {
        data = data.filter(this._filterFunction);
    }

    return data;
};


Group.prototype.computeFunction = function(c) {
    this._ordered = true;
    if (!arguments.length) {
        return this._compute;
    }
    this._compute = c;
    return this;
};


Group.prototype.orderFunction = function(o) {
    if (!arguments.length) {
        return this._orderFunction;
    }
    this._orderFunction = o;
    return this;
};

Group.prototype.compute = function() {
    this._compute();
};

Group.prototype.valueAccessor = function(v) {
    if (!arguments.length) {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};


Group.prototype.calculateTotals = function() {
    if (this._cumulative) {
        var totals = {};
        var total = 0;
        var self = this;
        var data = this._ordered ? this.getOrderedData() : this.getData();

        data
            .forEach(function(d, i) {

                var value = self._valueAccessor(d);

                if (typeof(value) != "object") {
                    total += value;
                    d.Cumulative = total;
                } else {
                    for (var property in value) {
                        var totalName = property + 'Cumulative';

                        if (totals[totalName]) {
                            totals[totalName] += value[property];
                            value[totalName] = totals[totalName];
                        } else {
                            totals[totalName] = value[property];
                            value[totalName] = totals[totalName];
                        }
                    }
                }
            });
    }
    return this;
};


function SimpleGroup(data) {
    this._data = data;
    this._orderFunction = function(a, b) {
        return b.values - a.values;
    };
}
SimpleGroup.prototype = Object.create(Group.prototype);
SimpleGroup.prototype.constructor = SimpleGroup;

SimpleGroup.prototype.getOrderedData = function() {
    return this._data.sort(this._orderFunction);
};

SimpleGroup.prototype.getData = function() {
    return this._data;
};

function NestedGroup(dimension, nestFunction) {
    this._dimension = dimension;
    this._data = dimension.Dimension.bottom(Infinity);
    this._nestFunction = nestFunction;
    this._nestedData = nestFunction.entries(this._data);
}


NestedGroup.prototype = Object.create(Group.prototype);
NestedGroup.prototype.constructor = NestedGroup;


NestedGroup.prototype.getData = function() {
    return this._nestedData;
};

NestedGroup.prototype.updateNestedData = function() {
    this._data = this._dimension.Dimension.bottom(Infinity);
    this._nestedData = this._nestFunction.entries(this._data);
};


NestedGroup.prototype.getOrderedData = function() {
    return this._nestedData;
};
;/**
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
    this._compute = null;
    this.gIndices = {};

    this._valueAccessor = function(d) {
        return d;
    };


    this._orderFunction = function(a, b) {
        return b.value.Count - a.value.Count;
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
     * The cumulatie function gets or sets the properties whose value occurences will be accumulated across this dimension.
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
    this.average = function(_) {
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
    var propertiesToAverage = this.average();

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
    var propertiesToAverage = this.average();

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

                            if (InsightUtils.isArray(propertyValue)) {

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

                            if (InsightUtils.isArray(propertyValue)) {

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

    if (this.dimension.multiple) {
        data = this._data.value()
            .values;
    } else {
        data = this._data.top(Infinity);
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
;function Series(name, chart, data, x, y, color) {

    this.chart = chart;
    this.data = data;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = d3.functor(color);
    this.animationDuration = 300;
    this.topValues = null;

    x.addSeries(this);
    y.addSeries(this);

    var self = this;
    var cssClass = "";

    var filter = null;

    // private functions used internally, set by functions below that are exposed on the object

    var xFunction = function(d) {
        return d.key;
    };

    var yFunction = function(d) {
        return d.value;
    };

    var tooltipFormat = function(d) {
        return d;
    };

    var tooltipAccessor = function(d) {
        return yFunction(d);
    };

    var tooltipFunction = function(d) {
        return tooltipFormat(tooltipAccessor(d));
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
            .map(xFunction);
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

    this.yFunction = function(_) {
        if (!arguments.length) {
            return yFunction;
        }

        yFunction = _;

        return this;
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


    this.findMax = function(scale) {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };

    this.draw = function() {};

    return this;
}
;function Chart(name, element, dimension) {

    this.name = name;
    this.element = element;
    this.dimension = dimension;

    var height = d3.functor(300);
    var width = d3.functor(300);
    var zoomable = false;
    var zoomScale = null;
    this.container = null;

    this.chart = null;

    this._margin = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };

    var series = [];
    var scales = [];
    var axes = [];
    var self = this;
    var barPadding = d3.functor(0.1);

    this.addAxis = function(axis) {
        axes.push(axis);
    };

    this.axes = function() {
        return axes;
    };


    this.addClipPath = function() {
        this.chart.append("clipPath")
            .attr("id", this.clipPath())
            .append("rect")
            .attr("x", 1)
            .attr("y", 0)
            .attr("width", this.width() - this.margin()
                .left - this.margin()
                .right)
            .attr("height", this.height() - this.margin()
                .top - this.margin()
                .bottom);
    };

    this.init = function(create, container) {
        this.container = create ? d3.select(container)
            .append('div') : d3.select(this.element)
            .append('div');

        this.container
            .attr('class', InsightConstants.ContainerClass)
            .style('width', this.width() + 'px')
            .style('position', 'relative')
            .style('display', 'inline-block');

        this.chartSVG = this.container
            .append("svg")
            .attr("class", InsightConstants.ChartSVG)
            .attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chartSVG.append("g")
            .attr('class', InsightConstants.Chart)
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");

        this.addClipPath();

        scales.map(function(scale) {
            scale.initialize();
        });

        axes.map(function(axis) {
            axis.initialize();
        });

        if (zoomable) {
            this.initZoom();
        }

        this.tooltip();

        this.draw(false);
    };

    this.resizeChart = function() {
        this.container.style('width', this.width() + "px");

        this.chartSVG
            .attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chart
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");

        this.chart.select("#" + this.clipPath())
            .append("rect")
            .attr("x", 1)
            .attr("y", 0)
            .attr("width", this.width() - this.margin()
                .left - this.margin()
                .right)
            .attr("height", this.height() - this.margin()
                .top - this.margin()
                .bottom);
    };

    this.draw = function(dragging) {
        this.resizeChart();

        this.recalculateScales();

        axes.map(function(axis) {
            axis.draw(dragging);
        });

        this.series()
            .map(function(series) {
                series.draw(dragging);
            });
    };

    this.recalculateScales = function() {
        scales.map(function(scale) {
            var zx = zoomScale != scale;
            if (zx) {
                scale.initialize();
            }
        });
    };

    this.zoomable = function(scale) {
        zoomable = true;
        zoomScale = scale;
        return this;
    };

    this.initZoom = function() {
        this.zoom = d3.behavior.zoom()
            .on("zoom", self.dragging.bind(self));

        this.zoom.x(zoomScale.scale);

        if (!this.zoomExists()) {
            this.chart.append("rect")
                .attr("class", "zoompane")
                .attr("width", this.width())
                .attr("height", this.height() - this.margin()
                    .top - this.margin()
                    .bottom)
                .style("fill", "none")
                .style("pointer-events", "all");
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

        return this.name.split(' ')
            .join('_') + "clip";
    };

    this.filterFunction = function(filter, element) {
        var value = filter.key ? filter.key : filter;

        return {
            name: value,
            element: element,
            filterFunction: function(d) {
                if (Array.isArray(d)) {
                    return d.indexOf(value) != -1;
                } else {
                    return String(d) == String(value);
                }
            }
        };
    };

    this.dimensionSelector = function(d) {

        var result = self.dimension && d.key.replace ? self.dimension.Name + d.key.replace(/[^A-Z0-9]/ig, "_") : "";

        return result;
    };

    this.filterClick = function(element, filter) {
        if (this.dimension) {
            var selected = d3.select(element)
                .classed('selected');

            d3.selectAll('.' + self.dimensionSelector(filter))
                .classed('selected', !selected);

            var filterFunction = this.filterFunction(filter, element);

            this.filterEvent(this.dimension, filterFunction);
        }
    };

    this.tooltip = function() {

        this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<span class='tipvalue'>" + d + "</span>";
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
            .classed("active", true);
    };

    this.mouseOut = function(chart, item, d) {
        this.tip.hide(d);

        d3.select(item)
            .classed("active", false);
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
    };


    this.scales = function(_) {
        if (!arguments.length) {
            return scales;
        }
        scales = _;
    };


    this.addHorizontalScale = function(type, typeString, direction) {
        var scale = new Scale(this, type, direction, typeString);
    };


    this.addHorizontalAxis = function(scale) {
        var axis = new Axis(this, scale, 'h', 'left');
    };

}
;var ChartGroup = function ChartGroup(name) {
    this.Name = name;
    this.Charts = [];
    this.Dimensions = [];
    this.FilteredDimensions = [];
    this.Groups = [];
    this.ComputedGroups = [];
    this.LinkedCharts = [];
    this.NestedGroups = [];
};

ChartGroup.prototype.initCharts = function() {
    this.Charts
        .forEach(
            function(chart) {
                chart.init();
            });
};

ChartGroup.prototype.addChart = function(chart) {

    chart.filterEvent = this.chartFilterHandler.bind(this);
    chart.triggerRedraw = this.redrawCharts.bind(this);

    this.Charts.push(chart);

    return chart;
};

ChartGroup.prototype.addDimension = function(ndx, name, func, displayFunc, multi) {
    var dimension = new Dimension(name, func, ndx.dimension(func), displayFunc, multi);

    this.Dimensions.push(dimension);

    return dimension;
};

ChartGroup.prototype.compareFilters = function(filterFunction) {
    return function(d) {
        return String(d.name) == String(filterFunction.name);
    };
};

ChartGroup.prototype.chartFilterHandler = function(dimension, filterFunction) {
    var self = this;

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
                self.removeMatchesFromArray(dim.Filters, comparerFunction);

            } else {
                // add the provided filter to the list for this dimension

                dim.Filters.push(filterFunction);
            }

            // reset this dimension if no filters exist, else apply the filter to the dataset.
            if (dim.Filters.length === 0) {

                self.removeItemFromArray(self.FilteredDimensions, dim);
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

        // recalculate non standard groups
        this.NestedGroups
            .forEach(
                function(group) {
                    group.updateNestedData();
                }
        );

        this.ComputedGroups
            .forEach(
                function(group) {
                    group.compute();
                }
        );

        this.redrawCharts();
    }
};



ChartGroup.prototype.redrawCharts = function() {
    for (var i = 0; i < this.Charts
        .length; i++) {
        this.Charts[i].draw();
    }
};


ChartGroup.prototype.aggregate = function(dimension, input) {

    var group;

    if (input instanceof Array) {

        group = this.multiReduceSum(dimension, input);

        this.Groups.push(group);

    } else {

        var data = dimension.Dimension.group()
            .reduceSum(input);

        group = new Group(data);

        this.Groups.push(group);
    }

    return group;
};

ChartGroup.prototype.count = function(dimension, input) {

    var group;

    if (input instanceof Array) {

        group = this.multiReduceCount(dimension, input);

        this.Groups.push(group);

    } else {
        var data = dimension.Dimension.group()
            .reduceCount(input);

        group = new Group(data);

        this.Groups.push(group);
    }

    return group;
};


ChartGroup.prototype.addSumGrouping = function(dimension, func) {
    var data = dimension.Dimension.group()
        .reduceSum(func);
    var group = new Group(data);

    this.Groups.push(group);
    return group;
};

ChartGroup.prototype.addCustomGrouping = function(group) {
    this.Groups.push(group);
    if (group.cumulative()) {
        this.CumulativeGroups.push(group);
    }
    return group;
};

ChartGroup.prototype.multiReduceSum = function(dimension, properties) {

    var data = dimension.Dimension.group()
        .reduce(
            function(p, v) {

                for (var property in properties) {
                    if (v.hasOwnProperty(properties[property])) {
                        p[properties[property]] += v[properties[property]];
                    }
                }
                return p;
            },
            function(p, v) {
                for (var property in properties) {
                    if (v.hasOwnProperty(properties[property])) {
                        p[properties[property]] -= v[properties[property]];
                    }
                }
                return p;
            },
            function() {
                var p = {};
                for (var property in properties) {
                    p[properties[property]] = 0;
                }
                return p;
            }
        );
    var group = new Group(data);

    return group;
};

ChartGroup.prototype.multiReduceCount = function(dimension, properties) {

    var data = dimension.Dimension.group()
        .reduce(
            function(p, v) {
                for (var property in properties) {
                    if (v.hasOwnProperty(properties[property])) {
                        p[properties[property]][v[properties[property]]] = p[properties[property]].hasOwnProperty(v[properties[property]]) ? p[properties[property]][v[properties[property]]] + 1 : 1;
                        p[properties[property]].Total++;
                    }
                }
                return p;
            },
            function(p, v) {
                for (var property in properties) {
                    if (v.hasOwnProperty(properties[property])) {
                        p[properties[property]][v[properties[property]]] = p[properties[property]].hasOwnProperty(v[properties[property]]) ? p[properties[property]][v[properties[property]]] - 1 : 1;
                        p[properties[property]].Total--;
                    }
                }
                return p;
            },
            function() {
                var p = {};
                for (var property in properties) {
                    p[properties[property]] = {
                        Total: 0
                    };
                }
                return p;
            }
        );

    var group = new Group(data);
    this.Groups.push(group);

    return group;
};

ChartGroup.prototype.removeMatchesFromArray = function(array, comparer) {
    var self = this;
    var matches = array.filter(comparer);
    matches.forEach(function(match) {
        self.removeItemFromArray(array, match);
    });
};
ChartGroup.prototype.removeItemFromArray = function(array, item) {

    var index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
};
;function BubbleSeries(name, chart, data, x, y, color) {

    Series.call(this, name, chart, data, x, y, color);

    var radiusFunction = d3.functor(10);
    var fillFunction = d3.functor(color);
    var maxRad = d3.functor(50);
    var minRad = d3.functor(7);
    var tooltipExists = false;
    var self = this;

    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);

        d3.select(this)
            .classed("hover", true);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
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


    this.fillFunction = function(_) {
        if (!arguments.length) {
            return fillFunction;
        }
        fillFunction = _;

        return this;
    };

    this.selector = this.name + InsightConstants.Bubble;

    this.className = function(d) {
        return self.selector + " " + InsightConstants.Bubble + " " + self.chart.dimensionSelector(d);
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
            return self.chart.filterClick(this, filter);
        };


        data.forEach(function(d) {
            var radiusInput = radiusFunction(d);

            d.radius = minRad() + (((radiusInput - min) * (maxRad() - minRad())) / (max - min));
        });

        //this sort ensures that smaller bubbles are on top of larger ones, so that they are always selectable.  Without changing original array
        data = data.concat()
            .sort(function(a, b) {
                return d3.descending(rad(a), rad(b));
            });

        var bubbles = this.chart.chart.selectAll('circle.' + self.selector)
            .data(data, self.keyAccessor);

        bubbles.enter()
            .append('circle')
            .attr('class', self.className)
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
                .attr('class', InsightConstants.ToolTipTextClass);
            tooltipExists = true;
        }

        bubbles.selectAll("." + InsightConstants.ToolTipTextClass)
            .text(this.tooltipFunction());
    };
}

BubbleSeries.prototype = Object.create(Series.prototype);
BubbleSeries.prototype.constructor = BubbleSeries;
;function RowSeries(name, chart, data, x, y, color) {

    Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var stacked = d3.functor(false);
    var seriesName = "";
    var tooltipExists = false;


    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };


    this.series = [{
        name: 'default',
        accessor: function(d) {
            return self.xFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor('silver'),
        label: 'Value'
    }];


    /**
     * RowSeries overrides the standard key function used by most, vertical charts.
     * @returns {object[]} return - The keys along the domain axis for this row series
     */
    this.keys = function() {
        return self.dataset()
            .map(self.yFunction());
    };


    this.tooltipFunction(function(d) {
        return self.tooltipFormat()(self.xFunction()(d));
    });


    /**
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
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
     * @constructor
     * @returns {Number} return - The largest value on the value scale of this ColumnSeries
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * This method gets or sets whether or not the series in this ColumnSeries are to be stacked or not.  This is false by default.
     * @returns {boolean} - Whether or not the columns are stacked (they are grouped if this returns false)
     */
    /**
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
        return self.y.scale(self.yFunction()(d));
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

        var position = self.stackedBars() ? self.x.scale(self.calculateXPos(func, d)) : 0;

        return position;
    };

    this.barThickness = function(d) {
        return self.y.scale.rangeBand(d);
    };

    this.groupedbarThickness = function(d) {

        var groupThickness = self.barThickness(d);

        var width = self.stackedBars() || (self.series.length == 1) ? groupThickness : groupThickness / self.series.length;

        return width;
    };

    this.offsetYPosition = function(d) {
        var thickness = self.groupedbarThickness(d);
        var position = self.stackedBars() ? self.yPosition(d) : self.calculateYPos(thickness, d);

        return position;
    };

    this.barWidth = function(d) {
        var func = self.series[self.currentSeries].accessor;

        return self.x.scale(func(d));
    };

    this.stackedBars = function() {
        return self.stacked();
    };

    this.className = function(d) {
        return seriesName + 'class bar ' + self.chart.dimensionSelector(d);
    };

    this.draw = function(drag) {
        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var groups = this.chart.chart
            .selectAll('g.' + InsightConstants.BarGroupClass)
            .data(this.dataset(), this.keyAccessor)
            .each(reset);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', InsightConstants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        var click = function(filter) {
            return self.chart.filterClick(this, filter);
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
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut)
                .on('click', click);

            if (!tooltipExists) {
                newBars.append('svg:text')
                    .attr('class', InsightConstants.ToolTipTextClass);
                tooltipExists = true;
            }

            var bars = groups.selectAll('.' + seriesName + 'class.bar')
                .transition()
                .duration(duration)
                .attr('y', this.offsetYPosition)
                .attr('x', this.xPosition)
                .attr('height', this.groupedbarThickness)
                .attr('width', this.barWidth);

            bars.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(s.tooltipValue);
        }
    };

    return this;
}


RowSeries.prototype = Object.create(Series.prototype);
RowSeries.prototype.constructor = RowSeries;
;function Scale(chart, title, scale, direction, type) {
    var ordered = d3.functor(false);
    var self = this;
    this.scale = scale;
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.rangeRound;
    this.series = [];
    this.title = title;
    this.chart = chart;
    this.type = type;
    this.direction = direction;
    this.bounds = [];

    chart.scales()
        .push(this);

    this.domain = function() {
        if (this.type == 'linear') {
            return [0, this.findMax()];
        } else if (this.type == 'ordinal') {
            return this.findOrdinalValues();
        }
        if (this.type == 'time') {
            return [this.minTime(), this.maxTime()];
        }
    };

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

    this.minTime = function() {
        var minTime = new Date(8640000000000000);

        this.series.map(function(series) {
            var cMin = d3.min(series.keys());
            minTime = cMin < minTime ? cMin : minTime;
        });
        return minTime;
    };


    this.maxTime = function() {
        var maxTime = new Date(-8640000000000000);

        this.series.map(function(series) {
            var cMax = d3.max(series.keys());
            maxTime = cMax > maxTime ? cMax : maxTime;
        });

        return maxTime;
    };


    this.findOrdinalValues = function() {
        var vals = [];

        this.series.map(function(series) {
            vals = series.keys();
        });

        return vals;
    };

    this.horizontal = function() {
        return this.direction == 'h';
    };

    this.vertical = function() {
        return this.direction == 'v';
    };


    this.findMax = function() {
        var max = 0;

        this.series.map(function(series) {
            var m = series.findMax(self);

            max = m > max ? m : max;
        });

        return max;
    };

    this.addSeries = function(series) {
        this.series.push(series);
    };


    this.initialize = function() {
        this.applyScaleRange.call(this.scale.domain(this.domain()), this.rangeType);
    };

    this.calculateRange = function() {
        this.scale.domain(this.domain());
    };

    this.applyScaleRange = function(rangeType) {
        var bounds = self.calculateBounds();

        self.bounds = bounds;

        rangeType.apply(this, [
            bounds, self.chart.barPadding()
        ]);
    };

    this.ordered = function(_) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(_);
        return this;
    };
}
;function Axis(chart, name, scale, anchor) {
    this.chart = chart;
    this.scale = scale;
    this.anchor = anchor ? anchor : 'left';
    this.name = name;

    var self = this;

    var tickSize = d3.functor(0);
    var tickPadding = d3.functor(10);
    var labelOrientation = d3.functor("lr");
    var orientation = scale.horizontal() ? d3.functor(this.anchor) : d3.functor(this.anchor);
    var textAnchor;

    if (scale.vertical()) {
        textAnchor = this.anchor == 'left' ? 'end' : 'start';
    }
    if (scale.horizontal()) {
        textAnchor = 'start';
    }

    var format = function(d) {
        return d;
    };

    this.chart.addAxis(this);

    this.format = function(_) {
        if (!arguments.length) {
            return format;
        }
        format = _;
        return this;
    };

    this.orientation = function(_) {
        if (!arguments.length) {
            return orientation();
        }
        orientation = d3.functor(_);
        return this;
    };

    this.tickSize = function(_) {
        if (!arguments.length) {
            return tickSize();
        }
        tickSize = d3.functor(_);
        return this;
    };

    this.tickPadding = function(_) {
        if (!arguments.length) {
            return tickPadding();
        }
        tickPadding = d3.functor(_);
        return this;
    };

    this.textAnchor = function(_) {
        if (!arguments.length) {
            return textAnchor;
        }
        textAnchor = _;
        return this;
    };

    this.labelOrientation = function(_) {
        if (!arguments.length) {
            return labelOrientation();
        }

        labelOrientation = d3.functor(_);

        return this;
    };

    this.tickRotation = function() {
        var offset = self.tickPadding() + (self.tickSize() * 2);
        offset = self.anchor == 'top' ? 0 - offset : offset;

        var rotation = this.labelOrientation() == 'tb' ? ' rotate(90,0,' + offset + ')' : '';

        return rotation;
    };

    this.transform = function() {
        var transform = "translate(";

        if (self.scale.horizontal()) {
            var transX = 0;
            var transY = self.anchor == 'top' ? 0 : (self.chart.height() - self.chart.margin()
                .bottom - self.chart.margin()
                .top);

            transform += transX + ',' + transY + ')';

        } else if (self.scale.vertical()) {
            var xShift = self.anchor == 'left' ? 0 : self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
            transform += xShift + ",0)";
        }

        return transform;
    };

    this.labelHorizontalPosition = function() {
        var pos = "";

        if (self.scale.horizontal()) {

        } else if (self.scale.vertical()) {

        }

        return pos;
    };

    this.labelVerticalPosition = function() {
        var pos = "";

        if (self.scale.horizontal()) {

        } else if (self.scale.vertical()) {

        }

        return pos;
    };

    this.positionLabels = function(labels) {

        if (self.scale.horizontal()) {

            labels.style('left', 0)
                .style(self.anchor, 0)
                .style('width', '100%')
                .style('text-align', 'center');
        } else if (self.scale.vertical()) {
            labels.style(self.anchor, '0')
                .style('top', '35%');
        }
    };

    this.initialize = function() {
        this.axis = d3.svg.axis()
            .scale(this.scale.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.format());

        this.chart.chart.append('g')
            .attr('class', self.name + ' ' + InsightConstants.AxisClass)
            .attr('transform', self.transform())
            .call(this.axis)
            .selectAll('text')
            .attr('class', self.name + ' ' + InsightConstants.AxisTextClass)
            .style('text-anchor', self.textAnchor())
            .style('transform', self.tickRotation());

        var labels = this.chart.container
            .append('div')
            .attr('class', self.name + InsightConstants.AxisLabelClass)
            .style('position', 'absolute')
            .text(self.scale.title);

        this.positionLabels(labels);

    };



    this.draw = function(dragging) {
        this.axis = d3.svg.axis()
            .scale(this.scale.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.format());

        var axis = this.chart.chart.selectAll('g.' + self.name + '.' + InsightConstants.AxisClass)
            .transition()
            .duration(500)
            .attr('transform', self.transform())
            .call(this.axis);

        axis
            .selectAll("text")
            .attr('transform', self.tickRotation())
            .style('text-anchor', self.textAnchor());

        d3.select(this.chart.element)
            .select('div.' + self.name + InsightConstants.AxisLabelClass)
            .text(self.scale.title);
    };
}
;function LineSeries(name, chart, data, x, y, color) {

    Series.call(this, name, chart, data, x, y, color);

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
        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i) {
        var val = 0;

        if (self.x.scale.rangeBand) {
            val = self.x.scale(self.xFunction()(d)) + (self.x.scale.rangeBand() / 2);
        } else {

            val = self.x.scale(self.xFunction()(d));
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
                .attr('class', InsightConstants.ToolTipTextClass);
            tooltipExists = true;
        }

        circles.selectAll("." + InsightConstants.ToolTipTextClass)
            .text(this.tooltipFunction());
    };

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };
}

LineSeries.prototype = Object.create(Series.prototype);
LineSeries.prototype.constructor = LineSeries;
;function ColumnSeries(name, chart, data, x, y, color) {

    Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var stacked = d3.functor(false);
    var seriesName = "";
    var barWidthFunction = this.x.rangeType;

    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };


    this.series = [{
        name: 'default',
        accessor: function(d) {
            return self.yFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor('silver'),
        label: 'Value'
    }];


    /**
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
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
     * @constructor
     * @returns {Number} return - The largest value on the value scale of this ColumnSeries
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * This method gets or sets whether or not the series in this ColumnSeries are to be stacked or not.  This is false by default.
     * @returns {boolean} - Whether or not the columns are stacked (they are grouped if this returns false)
     */
    /**
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
        return self.x.scale(self.xFunction()(d));
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
        return seriesName + 'class bar ' + self.chart.dimensionSelector(d);
    };

    this.draw = function(drag) {
        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var groups = this.chart.chart
            .selectAll('g.' + InsightConstants.BarGroupClass)
            .data(this.dataset(), this.keyAccessor)
            .each(reset);



        var newGroups = groups.enter()
            .append('g')
            .attr('class', InsightConstants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        var click = function(filter) {
            return self.chart.filterClick(this, filter);
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
                .attr('y', this.y.bounds[0])
                .attr('height', 0)
                .attr('fill', s.color)
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut)
                .on('click', click);

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipTextClass);

            var bars = groups.selectAll('.' + seriesName + 'class.bar');

            bars
                .transition()
                .duration(duration)
                .attr('y', this.yPosition)
                .attr('x', this.offsetXPosition)
                .attr('width', this.groupedBarWidth)
                .attr('height', this.barHeight);

            bars.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(s.tooltipValue);

        }

        groups.exit()
            .remove();
    };

    return this;
}

ColumnSeries.prototype = Object.create(Series.prototype);
ColumnSeries.prototype.constructor = ColumnSeries;
