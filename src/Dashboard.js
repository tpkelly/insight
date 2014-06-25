/**
 * This method is called when any post aggregation calculations, provided by the computeFunction() setter, need to be recalculated.
 * @constructor
 * @returns {this} this - Description
 * @param {object} name - Description
 */
var Dashboard = function Dashboard(name) {
    this.Name = name;
    this.Charts = [];
    this.Dimensions = [];
    this.FilteredDimensions = [];
    this.Groups = [];
    this.ComputedGroups = [];
    this.DimensionChartMap = {};

    //initialize the crossfilter to be null, populate as load() is called
    this.DataSets = [];
    this.ndx = null;

    return this;
};


/**
 * This method loads a JSON data set into the Dashboard, creating a new crossfiltered set and returnign that to the user to reference when creating charts/groupings.
 * @returns {object} return - A crossfilter dataset
 * @param {object} data - an array of objects to add to the dashboard
 * @param {string} name - an optional name for the dataset if multiple sets are being loaded into the dashboard.
 */
Dashboard.prototype.addData = function(data) {
    //type detection and preprocessing steps here

    var ndx = crossfilter(data);

    this.DataSets.push(ndx);

    return ndx;
};

Dashboard.prototype.addChart = function(chart) {

    var self = this;

    chart.triggerRedraw = this.redrawCharts.bind(this);

    this.Charts.push(chart);
    chart.series()
        .forEach(function(s) {
            if (s.data.dimension) {
                if (self.DimensionChartMap[s.data.dimension.Name]) {
                    self.DimensionChartMap[s.data.dimension.Name].push(s);
                } else {
                    self.DimensionChartMap[s.data.dimension.Name] = [s];
                }
            }
        });

    return chart;
};


/**
 * This method takes a dataset, name and grouping function, returning a Grouping with a Dimension created as part of that process.
 * @returns {object} Grouping - An aggregated Grouping that can be manipulated and have calculations applied to it
 * @param {object} dataset - A crossfilter, for example, returned by the addData() method
 * @param {string} name - A uniquely identifying name for the dimension along which this grouping is created. Used to identify identical dimensions in other datasets.
 * @param {function} groupFunction - The function used to group the dimension along.  Select the property of the underlying data that the dimension is to be defined on. Rounding or data manipulation can alter the granularity of the dimension
 */
Dashboard.prototype.group = function(dataset, name, groupFunction, multi) {

    var dim = new Dimension(name, groupFunction, dataset.dimension(groupFunction), groupFunction, multi);

    this.Dimensions.push(dim);

    var group = new Grouping(dim);

    group.preFilter = this.chartFilterHandler.bind(this);

    this.Groups.push(group);

    return group;
};

Dashboard.prototype.filterFunction = function(filter, element) {
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
};


Dashboard.prototype.compareFilters = function(filterFunction) {
    return function(d) {
        return String(d.name) == String(filterFunction.name);
    };
};


Dashboard.prototype.applyCSSClasses = function(chart, value, dimensionSelector) {
    var listeningSeries = this.DimensionChartMap[chart.data.dimension.Name];

    listeningSeries.forEach(function(series) {
        series.highlight(dimensionSelector, value);
    });
};

Dashboard.prototype.chartFilterHandler = function(chart, value, dimensionSelector) {
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

        this.ComputedGroups
            .forEach(
                function(group) {
                    group.compute();
                }
        );

        this.redrawCharts();
    }
};

Dashboard.prototype.initCharts = function() {
    this.Charts
        .forEach(
            function(chart) {
                chart.init();
            });
};


Dashboard.prototype.redrawCharts = function() {
    for (var i = 0; i < this.Charts
        .length; i++) {
        this.Charts[i].draw();
    }
};