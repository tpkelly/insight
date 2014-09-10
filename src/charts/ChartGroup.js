(function(insight) {

    /**
     * The ChartGroup class is a container for Charts and Tables, linking them together
     * and coordinating cross chart filtering and styling.
     * @class insight.ChartGroup
     */
    insight.ChartGroup = function ChartGroup() {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -----------------------------------------------------------------------------------------

        self.charts = [];
        self.tables = [];
        self.groupings = [];
        self.dimensions = [];
        self.filteredDimensions = [];
        self.dimensionListenerMap = {};

        // Private functions ------------------------------------------------------------------------------------------

        /*
         * This internal function responds to click events on Series and Tables,
         * alerting any other elements using the same Dimension that they need to
         * update to highlight the selected slices of the Dimension
         */
        function notifyListeners(dimensionName, dimensionSelector) {

            var listeningObjects = self.dimensionListenerMap[dimensionName];

            if (listeningObjects != null) {

                listeningObjects.forEach(function(item) {
                    item.toggleHighlight(dimensionSelector);
                });

            }
        }

        /*
         * This function takes a list of series and binds the click events of each one to the ChartGroup
         * filtering handler. It also adds the series' dataset to the internal list.
         */
        function addSeries(chart) {
            chart.series()
                .forEach(function(series) {

                    addDimensionListener(series.data, chart);

                    series.clickEvent = self.filterByGrouping;

                    addDataSet(series.data);
                });
        }

        /*
         * This function is called when a Chart belonging to this ChartGroup updates its list of Series.
         * The ChartGroup needs to register the click events and any crossfilter dimensions belonging to
         * the Series.
         */
        function newSeries(chart, series) {

            addSeries(chart, series);
        }

        /*
         * This function checks if the provided DataSet is crossfilter enabled,
         * and if so, adds its components to internal lists of Groupings and Dimensions.
         */
        function addDataSet(dataset) {

            // If this is a crossfilter enabled DataSet (aggregated and filter enabled)
            var crossfilterEnabled = dataset.dimension;

            if (crossfilterEnabled) {

                // Add Grouping and Dimension to internal lists if they are not already there
                insight.Utils.addToSet(self.groupings, dataset);
                insight.Utils.addToSet(self.dimensions, dataset.dimension);
            }
        }

        /*
         * Adds a Table to this ChartGroup, wiring up the Table's events to any
         * related Charts or Tables in the ChartGroup.
         * @memberof! insight.ChartGroup
         * @instance
         */
        function addTable(table) {

            // wire up the click event of the table to the filter handler of the DataSet
            table.clickEvent = self.filterByGrouping;

            addDimensionListener(table.data, table);

            self.tables.push(table);

            return table;
        }

        /*
         * Adds a Chart to this ChartGroup, wiring up the click events of each Series to the filter handler
         * @memberof! insight.ChartGroup
         * @instance
         */
        function addChart(chart) {

            chart.seriesChanged = newSeries;

            addSeries(chart);

            self.charts.push(chart);

            return chart;
        }

        /*
         * Given a DataSet and a widget (Table or Chart), this function adds the widget
         * to the map of items subscribed to events on that Dimension,
         * only if the provided DataSet is a crossfilter enabled one that exposes a dimension property.
         */
        function addDimensionListener(dataset, widget) {
            var dimension = dataset ? dataset.dimension : null;

            if (dimension) {
                var listeningObjects = self.dimensionListenerMap[dimension.name];

                if (listeningObjects) {

                    var alreadyListening = insight.Utils.arrayContains(listeningObjects, widget);

                    if (!alreadyListening) {
                        self.dimensionListenerMap[dimension.name].push(widget);
                    }
                } else {
                    self.dimensionListenerMap[dimension.name] = [widget];
                }
            }
        }

        // Internal functions -----------------------------------------------------------------------------------------

        /*
         * Method handler that is bound by the ChartGroup to the click events of any chart series or table rows,
         * if those entities' datasets are insight.Grouping objects.
         * It notifies any other listening charts of the dimensional selection event, which they can respond to
         * by applying CSS highlighting etc.
         * @memberof! insight.ChartGroup
         * @instance
         * @param {insight.Grouping} grouping - The grouping being filtered
         * @param {string} value - The value that the grouping is being filtered by.
         */
        self.filterByGrouping = function(grouping, value) {

            var dimensionSelector = insight.Utils.keySelector(value);
            var groupDimension = grouping.dimension;

            // send events to any charts or tables also using this dimension, as they will need to update their
            // styles to reflect the selection
            notifyListeners(groupDimension.name, dimensionSelector);

            var filterFunc = groupDimension.createFilterFunction(value);
            var nameProperty = 'name';

            // get the list of any dimensions matching the one that is being filtered
            var dims = insight.Utils.takeWhere(self.dimensions, nameProperty, groupDimension.name);

            // get the list of matching dimensions that are already filtered
            var activeDim = insight.Utils.takeWhere(self.filteredDimensions, nameProperty, groupDimension.name);

            // add the new filter to the list of active filters if it's not already active
            if (!activeDim.length) {
                self.filteredDimensions.push(groupDimension);
            }

            // loop through the matching dimensions to filter them all
            dims.forEach(function(dim) {
                dim.applyFilter(self.filteredDimensions, filterFunc);
            });

            // the above filtering will have triggered a re-aggregation of the groupings.  We must manually
            // initiate the recalculation of the groupings for any post aggregation calculations
            self.groupings.forEach(function(group) {
                group.recalculate();
            });

            self.draw();

        };

        self.clearFilters = function() {

            self.filteredDimensions = [];

            self.dimensions.forEach(function(dim) {
                dim.clearFilters();
            });

            // the above filtering will have triggered a re-aggregation of the groupings.  We must manually
            // initiate the recalculation of the groupings for any post aggregation calculations
            self.groupings.forEach(function(group) {
                group.recalculate();
            });

            self.charts.concat(self.tables).forEach(function(item) {
                item.clearHighlight();
            });

            self.draw();

        };

        /*
         * Draws all Charts and Tables in this ChartGroup
         * @memberof! insight.ChartGroup
         * @instance
         */
        self.draw = function() {

            self.charts.forEach(function(chart) {
                chart.draw();
            });

            self.tables.forEach(function(table) {
                table.draw();
            });
        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * Adds an item to this ChartGroup, calling the appropriate internal addChart or addTable function
         * depending on the type.
         * @memberof! insight.ChartGroup
         * @instance
         * @param {object} widget An insight.Table or insight.Chart
         * @returns {this}
         */
        self.add = function(widget) {
            if (widget instanceof insight.Chart) {
                addChart(widget);
            } else if (widget instanceof insight.Table) {
                addTable(widget);
            }
            return self;
        };

        //Apply the default look-and-feel
        self.applyTheme(insight.defaultTheme);
    };

    /**
     * Applies all properties from a theme to all charts and tables contained within the ChartGroup.
     * @memberof! insight.ChartGroup
     * @instance
     * @param {insight.Theme} theme The theme to apply to all charts and tables within the group.
     * @returns {this}
     */
    insight.ChartGroup.prototype.applyTheme = function(theme) {
        this.charts.forEach(function(chart) {
            chart.applyTheme(theme);
        });

        this.tables.forEach(function(table) {
            table.applyTheme(theme);
        });

        return this;
    };

})(insight);
