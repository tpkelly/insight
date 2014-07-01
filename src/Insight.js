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
