/**
 * This is the global namespace that also handles some global events and filtering logic (the logic could be moved into a specific class as it gets larger)
 * @namespace insight
 */
var insight = (function() {

    function checkChartWidths() {

        var innerWidth = window.innerWidth;

        insight.Charts.forEach(function(chart) {

            chart.resizeWidth(innerWidth);

        });

    }

    return {
        Charts: [],
        Tables: [],
        Groups: [],
        Dimensions: [],
        FilteredDimensions: [],
        DimensionListenerMap: {},
        init: function() {
            this.Charts = [];
            this.Groups = [];
            this.FilteredDimensions = [];
            this.DimensionListenerMap = {};

            window.onresize = checkChartWidths;
        },
        redraw: function() {

            this.Charts.forEach(function(chart) {
                chart.draw();
            });

            this.Tables.forEach(function(table) {
                table.draw();
            });
        },
        addTable: function(table) {

            // wire up the click event of the table to the filter handler of the DataSet
            table.clickEvent = table.data.filterHandler;

            this.Tables.push(table);

            return table;
        },
        addChart: function(chart) {

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
        applyCSSClasses: function(item, value, dimensionSelector) {
            var listeningObjects = this.DimensionListenerMap[item.data.dimension.Name];

            listeningObjects.forEach(function(item) {
                item.highlight(dimensionSelector, value);
            });
        },
        addDimensionListener: function(dataset, widget) {
            var dimension = dataset.dimension;

            if (dimension) {
                var listeningObjects = this.DimensionListenerMap[dimension.Name];
                if (listeningObjects && (listeningObjects.indexOf(widget) == -1)) {
                    listeningObjects.push(widget);
                } else {
                    this.DimensionListenerMap[dimension.Name] = [widget];
                }
            }
        },
        drawCharts: function() {

            var self = this;

            this.Charts
                .forEach(
                    function(chart) {
                        chart.series()
                            .forEach(function(series) {
                                self.addDimensionListener(series.data, chart);
                            });

                        chart.init();
                    });

            this.Tables.forEach(function(table) {
                self.addDimensionListener(table.data, table);
                table.draw();
            });
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
                        insight.Utils.removeMatchesFromArray(dim.Filters, comparerFunction);

                    } else {
                        // add the provided filter to the list for this dimension

                        dim.Filters.push(filterFunction);
                    }

                    // reset this dimension if no filters exist, else apply the filter to the dataset.
                    if (dim.Filters.length === 0) {

                        insight.Utils.removeItemFromArray(self.FilteredDimensions, dim);
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

                this.redraw();
            }
        }
    };

})();
