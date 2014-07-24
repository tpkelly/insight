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

            // Publicly accessible properties

            this.name = name;
            this.element = element;
            this.data = dataset;
            this.selectedItems = [];

            // private variables

            var self = this,
                columnProperties = [],
                tableInitialized = false,
                header,
                sortFunctions = [],
                topValues = null;


            // private methods

            var labelFunction = function(d) {
                return d.label;
            };
            var keyFunction = function(d) {
                return d.key;
            };
            var valueFunction = function(d) {
                return d.value;
            };

            var columnBuilder = function(row) {

                return self.columns()
                    .map(function(column) {
                        return {
                            column: column,
                            value: column.value(row)
                        };
                    });
            };


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

            /**
             * This private helper adds sorters to this Table's list of sorting methods and orders.
             * @param {function} sortFunction - The function to use in the sort comparison
             * @param {string} order - 'ASC' or 'DESC'
             */
            var addSortOrder = function(func, order) {
                var sort = {
                    sortParameter: func,
                    order: order
                };

                sortFunctions.push(sort);
            };

            // Public methods

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

            /**
             * This method adds an ascending sort to this Table's rows using the provided function as a comparison
             * @memberof insight.Table
             * @returns {object} this - Returns the Table object
             * @param {function} sortFunction - A function to define the object property to sort on: function(d) { return d.Age; }
             */
            this.ascending = function(sortFunction) {

                addSortOrder(sortFunction, 'ASC');

                return this;
            };


            /**
             * This method adds a descending sort to this Table's rows using the provided function as a comparison
             * @memberof insight.Table
             * @returns {object} this - Returns the Table object
             * @param {function} sortFunction - A function to define the object property to sort on: function(d) { return d.Age; }
             */
            this.descending = function(sortFunction) {

                addSortOrder(sortFunction, 'DESC');

                return this;
            };

            /**
             * This method gets or sets the number of rows to display.  Used in combination with ascending() or descending() to display top or bottom data.
             * @memberof insight.Table
             * @returns {int} topValues - How many values to display in the Table.
             */
            /**
             * @memberof insight.Table
             * @returns {object} this - this
             * @param {int} topValues - How many values to display in the Table.
             */
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

                data = insight.Utils.multiSort(data, sorters);

                if (this.top()) {
                    data = data.slice(0, this.top());
                }

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
                    .html(labelFunction);

                var rows = this.tableBody.selectAll('tr.' + insight.Constants.TableRowClass)
                    .data(data, keyFunction);

                rows.enter()
                    .append('tr')
                    .attr('class', rowClass)
                    .on('click', click)
                    .append('th')
                    .html(keyFunction);

                var cells = rows.selectAll('td')
                    .data(columnBuilder);

                cells.enter()
                    .append('td')
                    .html(valueFunction);

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
