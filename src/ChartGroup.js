var ChartGroup = function ChartGroup(name) {
    this.Name = name;
    this.Charts = [];
    this.Dimensions = [];
    this.FilteredDimensions = [];
    this.Groups = [];
    this.CumulativeGroups = [];
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

ChartGroup.prototype.addDimension = function(ndx, name, func, displayFunc) {
    var dimension = new Dimension(name, func, ndx.dimension(func), displayFunc);

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

        // d3.select(filterFunction.element)
        //     .classed('selected', true);

        var comparerFunction = this.compareFilters(filterFunction);

        dims.map(function(dim) {

            var filterExists = dim.Filters
                .filter(comparerFunction)
                .length;

            //if the dimension is already filtered by this value, toggle (remove) the filter
            if (filterExists) {

                self.removeMatchesFromArray(dim.Filters, comparerFunction);
                // d3.select(filterFunction.element)
                //     .classed('selected', false);

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
        this.CumulativeGroups
            .forEach(
                function(group) {
                    group.calculateTotals();
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

ChartGroup.prototype.multiReduceCount = function(dimension, property) {

    var data = dimension.Dimension.group()
        .reduce(
            function(p, v) {
                if (!p.hasOwnProperty(v[property])) {

                    p[v[property]] = 1;
                } else {
                    p[v[property]] += 1;
                }

                p.Total += 1;

                return p;
            },
            function(p, v) {

                if (v.hasOwnProperty(properties[property])) {
                    p[v[property]] -= 1;
                }
                p.Total--;
                return p;
            },
            function() {
                return {
                    Total: 0
                };
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
