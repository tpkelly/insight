(function(insight) {

    /**
     * The Table class draws HTML tables from DataSets
     * @constructor
     * @param {String} name - A uniquely identifying name for this table
     * @param {String} element - The css selector identifying the div container that the table will be drawn in.
     * @param {insight.Grouping} grouping - The Grouping to render this Table from
     * @example var myTable = new insight.Table('My Table', '#table-div', data);
     */
    insight.Table = function Table(name, element, grouping) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            columnProperties = [],
            tableInitialized = false,
            header,
            sortFunctions = [],
            topValues = null,
            headerTextColor = d3.functor('red'),
            headerFont = 'bold 16pt Helvetica Neue',
            rowHeaderTextColor = d3.functor('blue'),
            rowHeaderFont = 'bold 14pt Times New Roman',
            cellTextColor = d3.functor('green'),
            cellFont = '12pt Arial',
            headerDivider = '0px solid white',
            headerBackgroundColor = d3.functor('white'),
            rowBackgroundColor = d3.functor('white'),
            rowAlternateBackgroundColor = d3.functor(undefined); //Left as undefined, to default to rowBackgroundColor

        // Internal variables -----------------------------------------------------------------------------------------

        self.name = name;
        self.element = element;
        self.data = grouping;
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
                .attr('class', insight.constants.TableClass);

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
            return insight.constants.TableRowClass + ' ' + insight.utils.keySelector(keyFunction(dataPoint));
        }

        function click(dataItem) {

            self.clickEvent(self.data, keyFunction(dataItem));
        }

        // Adds sorters to this Table's list of sorting methods and orders.
        // @param {String} order - 'ASC' or 'DESC'
        function addSortOrder(func, order) {
            var sort = {
                sortParameter: func,
                order: order
            };

            sortFunctions.push(sort);
        }

        function rowColor(d, index) {
            var mainBackgroundColor = self.rowBackgroundColor();
            var alternateBackgroundColor = self.rowAlternateBackgroundColor();

            //Default to main row colour if alternate colour is undefined
            if (!alternateBackgroundColor()) {
                alternateBackgroundColor = mainBackgroundColor;
            }

            //Alternate the colours for rows
            return (index % 2 === 0) ? mainBackgroundColor() : alternateBackgroundColor();
        }

        // Internal functions -----------------------------------------------------------------------------------------

        // Toggle highlighting on items in this table.
        // The provided cssSelector is used to activate or deactivate highlighting on one or more selected rows.
        self.toggleHighlight = function(selector) {

            var clicked = self.tableBody.selectAll('.' + selector);
            var alreadySelected = clicked.classed('selected');

            if (alreadySelected) {
                clicked.classed('selected', false);
                insight.utils.removeItemFromArray(self.selectedItems, selector);
            } else {
                clicked.classed('selected', true)
                    .classed('notselected', false);
                self.selectedItems.push(selector);
            }

            var selected = self.tableBody.selectAll('.selected');
            var notselected = self.tableBody.selectAll('tr:not(.selected)');

            notselected.classed('notselected', selected[0].length > 0);
        };

        self.clearHighlight = function() {

            self.selectedItems = [];

            // if the table has not yet been drawn then there will be no tableBody so nothing to do here
            if (!self.tableBody) {
                return;
            }

            self.tableBody.selectAll('.selected')
                .classed('selected', false);

            self.tableBody.selectAll('.notselected')
                .classed('notselected', false);

        };

        // The public drawing method for the Table. It will also initialize the <table> element if required.
        self.draw = function() {

            var data = self.dataset();
            var columns = self.columns();

            if (!tableInitialized) {
                initializeTable();
            }

            header
                .style('border-bottom', self.headerDivider())
                .style('background-color', self.headerBackgroundColor());

            // draw column headers for properties
            header.selectAll('th.column')
                .data(columns)
                .enter()
                .append('th')
                .attr('class', 'column')
                .style('color', self.headerTextColor())
                .style('font', self.headerFont())
                .html(labelFunction);

            var rows = self.tableBody.selectAll('tr.' + insight.constants.TableRowClass)
                .data(data, keyFunction);

            rows.enter()
                .append('tr')
                .attr('class', rowClass)
                .on('click', click)
                .style('background-color', rowColor)
                .append('th')
                .style('color', self.rowHeaderTextColor())
                .style('font', self.rowHeaderFont())
                .html(keyFunction);

            var cells = rows.selectAll('td')
                .data(columnBuilder);

            cells.enter().append('td');

            cells.html(valueFunction)
                .style('color', self.cellTextColor())
                .style('font', self.cellFont());

            // remove any DOM elements no longer in the data set
            cells.exit().remove();
            rows.exit().remove();
        };

        // Public functions -------------------------------------------------------------------------------------------


        /**
         * The properties of the DataSet to use as columns.
         * @memberof! insight.Table
         * @instance
         * @returns {Array<Column>} - The current properties used as columns.
         *
         * @also
         *
         * Sets the properties of the DataSet to use as columns.
         * @memberof! insight.Table
         * @instance
         * @param {Array<Column>} columnProperties - The new properties to use as columns.
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
         * @returns {Function} - The function to use as the key accessor for this Table
         *
         * @also
         *
         * Sets the properties of the DataSet to use as columns.
         * @memberof! insight.Table
         * @instance
         * @param {Function} keyFunc - The function to use as the key accessor for this Table
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
         * @param {Function} sortFunction A function extracting the property to sort on from a data object.
         * @returns {this}.
         */
        self.ascending = function(sortFunction) {

            addSortOrder(sortFunction, 'ASC');

            return self;
        };

        /**
         * Adds a descending sort to this Table's rows using the provided function as a comparison
         * @memberof! insight.Table
         * @instance
         * @param {Function} sortFunction A function extracting the property to sort on from a data object.
         * @returns {this}.
         */
        self.descending = function(sortFunction) {

            addSortOrder(sortFunction, 'DESC');

            return self;
        };

        /**
         * The number of rows to display. Used in combination with [ascending]{@link insight.Table#self.ascending} or [descending]{@link insight.Table#self.descending} to display top or bottom data.
         * @memberof! insight.Table
         * @instance
         * @returns {Number} - The maximum number of top values being displayed.
         *
         * @also
         *
         * Sets the number of rows to display. Used in combination with [ascending]{@link insight.Table#self.ascending} or [descending]{@link insight.Table#self.descending}.
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
         * @memberof! insight.Table
         * @instance
         * @returns {Object[]} - The data set to be used by the table.
         */
        self.dataset = function() {

            var sorters = sortFunctions;

            var data = self.data.extractData();

            data = insight.utils.multiSort(data, sorters);

            if (self.top()) {
                data = data.slice(0, self.top());
            }

            return data;
        };

        /**
         * The text color to use for the table headings.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the color of the table headings.
         *
         * @also
         *
         * Sets the color to use for the table headings.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.headerTextColor = function(color) {
            if (!arguments.length) {
                return headerTextColor;
            }
            headerTextColor = d3.functor(color);
            return self;
        };

        /**
         * The font to use for the table headings.
         * @memberof! insight.Table
         * @instance
         * @returns {Font} - The font to use for the table headings.
         *
         * @also
         *
         * Sets the font to use for the table headings.
         * @memberof! insight.Table
         * @instance
         * @param {Font} font The font to use for the table headings.
         * @returns {this}
         */
        self.headerFont = function(font) {
            if (!arguments.length) {
                return headerFont;
            }
            headerFont = font;
            return self;
        };

        /**
         * The text color to use for the row headings.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the color of the row headings.
         *
         * @also
         *
         * Sets the color to use for the row headings.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.rowHeaderTextColor = function(color) {
            if (!arguments.length) {
                return rowHeaderTextColor;
            }
            rowHeaderTextColor = d3.functor(color);
            return self;
        };

        /**
         * The font to use for the row headings.
         * @memberof! insight.Table
         * @instance
         * @returns {Font} - The font to use for the row headings.
         *
         * @also
         *
         * Sets the font to use for the row headings.
         * @memberof! insight.Table
         * @instance
         * @param {Font} font The font to use for the row headings.
         * @returns {this}
         */
        self.rowHeaderFont = function(font) {
            if (!arguments.length) {
                return rowHeaderFont;
            }
            rowHeaderFont = font;
            return self;
        };

        /**
         * The text color to use for the cells.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the color of the cells.
         *
         * @also
         *
         * Sets the color to use for the cells.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.cellTextColor = function(color) {
            if (!arguments.length) {
                return cellTextColor;
            }
            cellTextColor = d3.functor(color);
            return self;
        };

        /**
         * The font to use for the cells.
         * @memberof! insight.Table
         * @instance
         * @returns {Font} - The font to use for the cells.
         *
         * @also
         *
         * Sets the font to use for the cells.
         * @memberof! insight.Table
         * @instance
         * @param {Font} font The font to use for the cells.
         * @returns {this}
         */
        self.cellFont = function(font) {
            if (!arguments.length) {
                return cellFont;
            }
            cellFont = font;
            return self;
        };

        /**
         * The style of the divider between the headers and table body
         * @memberof! insight.Table
         * @instance
         * @returns {Border} - The style of the divider between the headers and table body.
         *
         * @also
         *
         * Sets the style of the divider between the headers and table body.
         * @memberof! insight.Table
         * @instance
         * @param {Border} dividerStyle The style of the divider between the headers and table body.
         * @returns {this}
         */
        self.headerDivider = function(dividerStyle) {
            if (!arguments.length) {
                return headerDivider;
            }
            headerDivider = dividerStyle;
            return self;
        };

        /**
         * The background color to use for the table headings.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the background color of the table headings.
         *
         * @also
         *
         * Sets the background color to use for the table headings.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.headerBackgroundColor = function(color) {
            if (!arguments.length) {
                return headerBackgroundColor;
            }
            headerBackgroundColor = d3.functor(color);
            return self;
        };

        /**
         * The background color to use for the rows.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the background color of the rows.
         *
         * @also
         *
         * Sets the background color to use for the rows.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.rowBackgroundColor = function(color) {
            if (!arguments.length) {
                return rowBackgroundColor;
            }
            rowBackgroundColor = d3.functor(color);
            return self;
        };

        /**
         * The alternate background color to use for the rows, to appear on every other row.
         * If undefined, then the alternate row background color defaults to using the [rowBackgroundColor]{@link insight.Table#self.rowBackgroundColor}.
         * @memberof! insight.Axis
         * @instance
         * @returns {Function} - A function that returns the alternate background color of the rows.
         *
         * @also
         *
         * Sets the alternate background color to use for the rows.
         * If undefined, then the alternate row background color defaults to using the [rowBackgroundColor]{@link insight.Table#self.rowBackgroundColor}.
         * @memberof! insight.Axis
         * @instance
         * @param {Function|Color} color Either a function that returns a color, or a color.
         * @returns {this}
         */
        self.rowAlternateBackgroundColor = function(color) {
            if (!arguments.length) {
                return rowAlternateBackgroundColor;
            }
            rowAlternateBackgroundColor = d3.functor(color);
            return self;
        };

        self.applyTheme(insight.defaultTheme);

    };

    /* Skeleton event overriden by any listening objects to subscribe to the click event of the table rows
     * @param {Object} series - The row being clicked
     * @param {Object[]} filter - The value of the point selected, used for filtering/highlighting
     */
    insight.Table.prototype.clickEvent = function(series, filter) {

    };

    /**
     * Applies all properties from a theme to the table.
     * @memberof! insight.Table
     * @instance
     * @param {insight.Theme} theme The theme to apply to the table.
     * @returns {this}
     */
    insight.Table.prototype.applyTheme = function(theme) {

        this.headerFont(theme.tableStyle.headerFont);
        this.headerTextColor(theme.tableStyle.headerTextColor);

        this.rowHeaderFont(theme.tableStyle.rowHeaderFont);
        this.rowHeaderTextColor(theme.tableStyle.rowHeaderTextColor);

        this.cellFont(theme.tableStyle.cellFont);
        this.cellTextColor(theme.tableStyle.cellTextColor);

        this.headerDivider(theme.tableStyle.headerDivider);

        this.headerBackgroundColor(theme.tableStyle.headerBackgroundColor);
        this.rowBackgroundColor(theme.tableStyle.rowBackgroundColor);
        this.rowAlternateBackgroundColor(theme.tableStyle.rowAlternateBackgroundColor);

        return this;
    };

})(insight);
