var ChartGroup = function ChartGroup(name) {
    this.Name = name;
    this.Charts = [];
    this.Dimensions = [];
    this.FilteredDimensions = [];
    this.Groups = [];
    this.ComputedGroups = [];
    this.LinkedCharts = [];
    this.NestedGroups = [];
    this.DimensionChartMap = {};
};

ChartGroup.prototype.initCharts = function() {
    this.Charts
        .forEach(
            function(chart) {
                chart.init();
            });
};

ChartGroup.prototype.addChart = function(chart) {

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

ChartGroup.prototype.addGroup = function(group) {

    group.preFilter = this.chartFilterHandler.bind(this);

    group.initialize();

    this.Groups.push(group);

    return this;
};

ChartGroup.prototype.addDimension = function(ndx, name, func, displayFunc, multi) {
    var dimension = new Dimension(name, func, ndx.dimension(func), displayFunc, multi);

    this.Dimensions.push(dimension);

    return dimension;
};


ChartGroup.prototype.filterFunction = function(filter, element) {
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


ChartGroup.prototype.compareFilters = function(filterFunction) {
    return function(d) {
        return String(d.name) == String(filterFunction.name);
    };
};

ChartGroup.prototype.applyCSSClasses = function(chart, value, dimensionSelector) {
    var listeningSeries = this.DimensionChartMap[chart.data.dimension.Name];

    listeningSeries.forEach(function(chart) {
        chart.highlight(dimensionSelector, value);
    });
};

ChartGroup.prototype.chartFilterHandler = function(chart, value, dimensionSelector) {
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
