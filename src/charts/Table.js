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
            this.selectedItems = [];

            // private variables

            var self = this,
                columnProperties = [],
                tableInitialized = false,
                header;


            // private methods

            var initializeTable = function() {
                self.tableElement = d3.select(self.element)
                    .append('table')
                    .attr('class', insight.Constants.TableClass);

                header = self.tableElement.append('thead')
                    .append('tr');

                header.append('th')
                    .attr('class', 'blank')
                    .html('');

                tableInitialized = true;
            };


            var rowClass = function(dataPoint) {
                return insight.Constants.TableRowClass + ' ' + insight.Utils.sliceSelector(dataPoint);
            };


            var click = function(element, filter) {

                var selector = insight.Utils.sliceSelector(filter);

                self.clickHandler(self, filter, selector);
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


            /**
             * This method returns the data set used by this Series.
             * @returns {object[]} dataset - The data set to be used by the series
             */
            this.dataset = function() {

                var data = self.data.getData();

                return data;
            };

            /**
             * This method is called to toggle highlighting on items in this table.
             * The provided cssSelector is used to activate or deactivate highlighting on one or more selected rows.
             * @param {string} selector - The dimensional selector used to highlight items in this table (usually of the form in_DimensioName)
             */
            this.highlight = function(selector) {

                var clicked = self.tableElement.selectAll('.' + selector);
                var alreadySelected = clicked.classed('selected');

                if (alreadySelected) {
                    clicked.classed('selected', false);
                    insight.Utils.removeItemFromArray(self.selectedItems, selector);
                } else {
                    clicked.classed('selected', true)
                        .classed('notselected', false);
                    self.selectedItems.push(selector);
                }

                var selected = this.tableElement.selectAll('.selected');
                var notselected = this.tableElement.selectAll('tr:not(.selected)');

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

                var rows = this.tableElement.selectAll('tr.' + insight.Constants.TableRowClass)
                    .data(data);

                rows.enter()
                    .append('tr')
                    .attr('class', rowClass)
                    .append('th')
                    .html(function(d) {
                        return d.key;
                    })
                    .on('click', function() {});

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
        Table.prototype.clickHandler = function(series, filter) {

        };

        return Table;
    })();
})(insight);
