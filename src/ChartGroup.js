var ChartGroup = function ChartGroup(name) {
    this.Name = name;
    this.Charts = ko.observableArray();
    this.Dimensions = ko.observableArray();
    this.Groups = ko.observableArray();
    this.CumulativeGroups = ko.observableArray();
};

ChartGroup.prototype.addChart = function(chart) {

    chart.init();

    chart.filterEvent = this.chartFilterHandler.bind(this);
    chart.triggerRedraw = this.redrawCharts.bind(this);

    this.Charts.push(chart);

    return chart;
};

ChartGroup.prototype.addDimension = function(ndx, name, func, displayFunc) {

    var dimension = new Dimension(name, ndx.dimension(func), displayFunc);

    this.Dimensions.push(dimension);

    return dimension;
};


ChartGroup.prototype.chartFilterHandler = function(chart, filterValue) {

    var self = this;

    var dims = this.Dimensions().filter(function(d) {
        return d.Name == chart.dimension.Name;
    });

    dims.map(function(dim) {

        if (dim.Filters) {

            var filterExists = dim.Filters().filter(function(d) {
                return String(d.name) == String(filterValue.name);
            }).length;

            //if the dimension is already filtered by this value, toggle (remove) the filter
            if (filterExists) {
                dim.Filters.remove(function(filter) {
                    return filter.name == filterValue.name;
                });
            } else {
                // add the provided filter to the list for this dimension
                dim.Filters.push(filterValue);
            }
        }

        // reset this dimension if no filters exist, else apply the filter to the dataset.
        if (dim.Filters().length === 0) {
            dim.Dimension.filterAll();
        } else {
            dim.Dimension.filter(function(d) {
                var vals = dim.Filters().map(function(func) {
                    return func.filterFunction(d);
                });
                return vals.filter(function(result) {
                    return result;
                }).length;
            });
        }

    });

    this.CumulativeGroups().forEach(
        function(group) {
            group.calculateTotals();
        }
    );

    this.redrawCharts();
};

ChartGroup.prototype.redrawCharts = function() {
    for (var i = 0; i < this.Charts().length; i++) {
        this.Charts()[i].draw();
    }
};

ChartGroup.prototype.addSumGrouping = function(dimension, func) {
    var data = dimension.Dimension.group().reduceSum(func);
    var group = new Group(data, false);

    this.Groups.push(group);
    return group;
};

ChartGroup.prototype.addCustomGrouping = function(group) {
    this.Groups.push(group);
    if (group.cumulative) {
        this.CumulativeGroups.push(group);
    }
    return group;
};
