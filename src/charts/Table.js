(function(insight) {

    /**
     * The Table class draws HTML tables from DataSets
     * @class insight.Table
     * @param {string} name - A uniquely identifying name for this table
     * @param {string} element - The css selector identifying the div container that the table will be drawn in. '#dataTable' for example.
     * @param {DataSet} dataset - The DataSet to render this Table from
     */
    insight.Table = function Table(name, element, dataset) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            columnProperties = [],
            tableInitialized = false,
            header,
            sortFunctions = [],
            topValues = null;

        // Internal variables -----------------------------------------------------------------------------------------

        self.name = name;
        self.element = element;
        self.data = dataset;
        self.selectedItems = [];

        // Private functions ------------------------------------------------------------------------------------------

        function labelFunction(d) {
            return d.label;
        }

        function keyFunction(d) {
            return d.key;
        }

        function valueFunction(d) {
            return d.value;
        }

        function columnBuilder(row) {

            return self.columns()
                .map(function(column) {
                    return {
                        column: column,
                        value: column.value(row)
                    };
                });
        }

        // Creates the main <table>, <thead> and <tbody> sections of this Table
        function initializeTable() {
            self.tableElement = d3.select(self.element)
                .append('table')
                .attr('class', insight.Constants.TableClass);

            header = self.tableElement
                .append('thead')
                .append('tr');

            header.append('th')
                .attr('class', 'blank')
                .html('');

            self.tableBody = self.tableElement.append('tbody');

            tableInitialized = true;
        }

        function rowClass(dataPoint) {
            return insight.Constants.TableRowClass + ' ' + insight.Utils.keySelector(keyFunction(dataPoint));
        }

        function click(dataItem) {

            self.clickEvent(self.data, keyFunction(dataItem));
        }

        // Adds sorters to this Table's list of sorting methods and orders.
        // @param {string} order - 'ASC' or 'DESC'
        function addSortOrder(func, order) {
            var sort = {
                sortParameter: func,
                order: order
            };

            sortFunctions.push(sort);
        }

        // Internal functions -----------------------------------------------------------------------------------------

        // Toggle highlighting on items in this table.
        // The provided cssSelector is used to activate or deactivate highlighting on one or more selected rows.
        self.toggleHighlight = function(selector) {

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

            var selected = self.tableBody.selectAll('.selected');
            var notselected = self.tableBody.selectAll('tr:not(.selected)');

            notselected.classed('notselected', selected[0].length > 0);
        };

        // The public drawing method for the Table. It will also initialize the <table> element if required.
        self.draw = function() {

            var data = self.dataset();
            var columns = self.columns();

            if (!tableInitialized) {
                initializeTable();
            }

            // draw column headers for properties
            header.selectAll('th.column')
                .data(columns)
                .enter()
                .append('th')
                .attr('class', 'column')
                .html(labelFunction);

            var rows = self.tableBody.selectAll('tr.' + insight.Constants.TableRowClass)
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
                .append('td');

            cells.html(valueFunction);

            // remove any DOM elements no longer in the data set
            cells.exit()
                .remove();

            rows.exit()
                .remove();
        };

        // Public functions -------------------------------------------------------------------------------------------


        /**
         * The properties of the DataSet to use as columns.
         * @memberof! insight.Table
         * @instance
         * @returns {object[]} - The current properties used as columns, of the form {'label':... , 'value':... }.
         *
         * @also
         *
         * Sets the properties of the DataSet to use as columns.
         * @memberof! insight.Table
         * @instance
         * @param {object[]} columnProperties - The new properties to use as columns, of the form {'label':... , 'value':... }.
         * @returns {this}
         */
        self.columns = function(value) {
            if (!arguments.length) {
                return columnProperties;
            }
            columnProperties = value;
            return self;
        };

        /**
         * The key function to use for this Table.
         * @memberof! insight.Table
         * @instance
         * @returns {function} - The function to use as the key accessor for this Table
         *
         * @also
         *
         * Sets the properties of the DataSet to use as columns.
         * @memberof! insight.Table
         * @instance
         * @param {function} keyFunc - The function to use as the key accessor for this Table
         * @returns {this}
         */
        self.keyFunction = function(keyFunc) {
            if (!arguments.length) {
                return keyFunction;
            }
            keyFunction = keyFunc;
            return self;
        };

        /**
         * This method adds an ascending sort to this Table's rows using the provided function as a comparison
         * @memberof! insight.Table
         * @instance
         * @param {function} sortFunction A function extracting the property to sort on from a data object.
         * @returns {object} this Returns the Table object
         */
        self.ascending = function(sortFunction) {

            addSortOrder(sortFunction, 'ASC');

            return self;
        };

        /**
         * Adds a descending sort to this Table's rows using the provided function as a comparison
         * @memberof! insight.Table
         * @instance
         * @param {function} sortFunction A function extracting the property to sort on from a data object.
         * @returns {object} this Returns the Table object.
         */
        self.descending = function(sortFunction) {

            addSortOrder(sortFunction, 'DESC');

            return self;
        };

        /**
         * The number of rows to display. Used in combination with ascending() or descending() to display top or bottom data.
         * @memberof! insight.Table
         * @instance
         * @returns {Number} - The maximum number of top values being displayed.
         *
         * @also
         *
         * Sets the number of rows to display. Used in combination with ascending() or descending() to display top or bottom data.
         * @memberof! insight.Table
         * @instance
         * @param {Number} topValueCount How many values to display in the Table.
         * @returns {this}
         */
        self.top = function(top) {
            if (!arguments.length) {
                return topValues;
            }
            topValues = top;

            return self;
        };

        /**
         * Returns the array of data objects used to draw this table.
         * @memberof! insight.Series
         * @instance
         * @returns {object[]} - The data set to be used by the table.
         */
        self.dataset = function() {

            var sorters = sortFunctions;

            var data = self.data.getData();

            data = insight.Utils.multiSort(data, sorters);

            if (self.top()) {
                data = data.slice(0, self.top());
            }

            return data;
        };

        self.applyTheme(insight.defaultTheme);

    };

    /* Skeleton event overriden by any listening objects to subscribe to the click event of the table rows
     * @param {object} series - The row being clicked
     * @param {object[]} filter - The value of the point selected, used for filtering/highlighting
     */
    insight.Table.prototype.clickEvent = function(series, filter) {

    };

    /**
     * Applies all properties from a theme to the table.
     * @memberof! insight.Table
     * @instance
     * @todo Extract relevant properties and save them to the table.
     * @param {insight.Theme} theme The theme to apply to the table.
     * @returns {this}
     */
    insight.Table.prototype.applyTheme = function(theme) {
        return this;
    };

})(insight);
