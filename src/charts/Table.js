(function(insight) {

    insight.Table = (function() {

        /**
         * The Table class draws HTML tables from DataSets
         * @class insight.Table
         * @param {string} name - A uniquely identifying name for this table
         * @param {string} element - The css selector identifying the div container that the table will be drawn in. '#dataTable' for example.
         * @param {DataSet} dataset - The DataSet to render this Table from
         */
        function Table(name, element, dataset) {
            this.name = name;
            this.element = element;
            this.data = dataset;
            topValues = null;

            // private variables

            var self = this,
                columnProperties = [],
                tableInitialized = false,
                selectedItems = [],
                header,
                sortFunctions = [];


            // private methods

            /**
             * This method creates the main <table>, <thead> and <tbody> sections of this Table
             */
            var initializeTable = function() {
                self.tableElement = d3.select(self.element)
                    .append('table')
                    .attr('class', insight.Constants.TableClass);

                header = self.tableElement.append('thead')
                    .append('tr');

                header.append('th')
                    .attr('class', 'blank')
                    .html('');

                self.tableBody = self.tableElement.append('tbody');

                tableInitialized = true;
            };


            /**
             * This method takes a data point and returns a class name based based on the group key
             * @returns {string} cssClass - The css class to identify this row based on its dimension
             * @param {object} dataPoint - The underlying data for this rows class name
             */
            var rowClass = function(dataPoint) {
                return insight.Constants.TableRowClass + ' ' + insight.Utils.keySelector(dataPoint);
            };


            /**
             * This local click handler forwards any click events to any click handler subscribed to this Table's clicks.
             * @param {object} dataPoint - The underlying data for the row being clicked.
             */
            var click = function(dataItem) {

                var selector = insight.Utils.keySelector(dataItem);

                self.clickEvent(self, dataItem, selector);
            };

            var addSortOrder = function(func, order) {
                var sort = {
                    sortFunction: func,
                    order: order
                };

                sortFunctions.push(sort);
            };

            this.multiSort = function(data) {

                var sortOrders = sortFunctions;

                var sortFunction = function(a, b) {
                    var sortIndex = 0;
                    var currentSort = sortOrders[sortIndex];
                    var currentFunction = currentSort.sortFunction;
                    var result = null;

                    if (currentFunction(a) > currentFunction(b)) {
                        result = currentSort.order == 'ASC' ? 1 : -1;
                    } else if (currentFunction(a) < currentFunction(b)) {
                        result = currentSort.order == 'ASC' ? -1 : 1;
                    }

                    // if the values are equal, keep on trying if there are more sorting options
                    while (result === null && (++sortIndex < sortOrders.length)) {

                        currentSort = sortOrders[sortIndex];
                        currentFunction = currentSort.sortFunction;

                        if (currentFunction(a) > currentFunction(b)) {
                            result = currentSort.order == 'ASC' ? 1 : -1;
                        }
                        if (currentFunction(a) < currentFunction(b)) {
                            result = currentSort.order == 'ASC' ? -1 : 1;
                        }
                    }

                    result = result === null ? 0 : result;

                    return result;
                };

                return data.sort(sortFunction);
            };

            // public methods

            /**
             * This method gets or sets the properties of the DataSet to use as columns.
             * the properties array contains objects of the form {label: , value: }.
             * @memberof insight.Table
             * @returns {object[]} columnProperties - An array of {label: , value: } objects
             */
            /**
             * @memberof insight.Table
             * @returns {object} this - this
             * @param {object[]} columnProperties - An array of {label: , value: } objects
             */
            this.columns = function(value) {
                if (!arguments.length) {
                    return columnProperties;
                }
                columnProperties = value;
                return this;
            };

            this.ascending = function(sortFunction) {

                addSortOrder(sortFunction, 'ASC');

                return this;
            };

            this.descending = function(sortFunction) {

                addSortOrder(sortFunction, 'DESC');

                return this;
            };


            this.top = function(top) {
                if (!arguments.length) {
                    return topValues;
                }
                topValues = top;

                return this;
            };

            /**
             * This method returns the data set used by this Series.
             * @returns {object[]} dataset - The data set to be used by the series
             */
            this.dataset = function() {

                var sorters = sortFunctions;

                var data = self.data.getData();

                data = self.multiSort(data);

                return data;
            };

            /**
             * This method is called to toggle highlighting on items in this table.
             * The provided cssSelector is used to activate or deactivate highlighting on one or more selected rows.
             * @param {string} selector - The dimensional selector used to highlight items in this table (usually of the form in_DimensioName)
             */
            this.highlight = function(selector) {

                var clicked = self.tableBody.selectAll('.' + selector);
                var alreadySelected = clicked.classed('selected');

                if (alreadySelected) {
                    clicked.classed('selected', false);
                    insight.Utils.removeItemFromArray(self.selectedItems, selector);
                } else {
                    clicked.classed('selected', true)
                        .classed('notselected', false);
                    self.selectedItems.push(selector);
                }

                var selected = this.tableBody.selectAll('.selected');
                var notselected = this.tableBody.selectAll('tr:not(.selected)');

                notselected.classed('notselected', selected[0].length > 0);
            };


            /**
             * This is the public drawing method for the Table.  It will also initialize the <table> element if required.
             */
            this.draw = function() {

                var data = this.dataset();
                var columns = this.columns();

                if (!tableInitialized)
                    initializeTable();

                // draw column headers for properties
                header.selectAll('th.column')
                    .data(columns)
                    .enter()
                    .append('th')
                    .attr('class', 'column')
                    .html(function(d) {
                        return d.label;
                    });

                var rows = this.tableBody.selectAll('tr.' + insight.Constants.TableRowClass)
                    .data(data);

                rows.enter()
                    .append('tr')
                    .attr('class', rowClass)
                    .on('click', click)
                    .append('th')
                    .html(function(d) {
                        return d.key;
                    });

                var cells = rows.selectAll('td')
                    .data(function(row) {
                        return columns
                            .map(function(column) {
                                return {
                                    column: column,
                                    value: column.value(row)
                                };
                            });
                    });

                cells.enter()
                    .append('td')
                    .html(function(d) {
                        return d.value;
                    });

                // remove any DOM elements no longer in the data set
                cells.exit()
                    .remove();
                rows.exit()
                    .remove();
            };

            return this;
        }

        /* Skeleton event overriden by any listening objects to subscribe to the click event of the table rows
         * @param {object} series - The row being clicked
         * @param {object[]} filter - The value of the point selected, used for filtering/highlighting
         */
        Table.prototype.clickEvent = function(series, filter) {

        };

        return Table;
    })();
})(insight);
