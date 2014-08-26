(function(insight) {

    /**
     * The ColumnSeries class extends the Series class and draws vertical bars on a Chart
     * @class insight.ColumnSeries
     * @param {string} name - A uniquely identifying name for this chart
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.ColumnSeries = function ColumnSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables -----------------------------------------------------------------------------------------

        var self = this,
            stacked = d3.functor(false),
            seriesName = '',
            seriesFunctions = {},
            barWidthFunction = self.x.rangeType;

        // Internal variables ------------------------------------------------------------------------------------------

        self.classValues = [insight.Constants.BarClass];

        // Private functions -----------------------------------------------------------------------------------------

        function tooltipFunction(d) {
            var func = self.currentSeries.valueFunction;
            return self.tooltipFormat()(func(d));
        }

        function click(filter) {
            return self.click(self, filter);
        }

        function duration(d, i) {
            return 200 + (i * 20);
        }

        function mouseOver(data, i) {
            var seriesName = this.getAttribute('in_series');
            var seriesFunction = seriesFunctions[seriesName];

            self.mouseOver.call(this, data, i, seriesFunction);
        }

        // Internal functions ----------------------------------------------------------------------------------------

        self.series = [{
            name: 'default',
            valueFunction: function(d) {
                return self.valueFunction()(d);
            },
            tooltipValue: function(d) {
                return self.tooltipFunction()(d);
            },
            color: self.color,
            label: 'Value'
        }];

        /*
         * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
         * This function is mapped across the entire data array by the findMax method.
         * @memberof insight.ColumnSeries
         * @param {object} data An item in the object array to query
         * @returns {Number} - The maximum value within the range of the values for this series on the given axis.
         */
        self.seriesMax = function(d) {
            var max = 0;
            var seriesMax = 0;

            var stacked = self.stacked();

            for (var series in self.series) {
                var s = self.series[series];

                var seriesValue = s.valueFunction(d);

                seriesMax = stacked ? seriesMax + seriesValue : seriesValue;

                max = seriesMax > max ? seriesMax : max;
            }

            return max;
        };

        /*
         * Extracts the maximum value on an axis for this series.
         * @memberof! insight.ColumnSeries
         * @instance
         * @returns {Number} - The maximum value within the range of the values for this series on the given axis.
         */
        self.findMax = function() {
            var max = d3.max(self.dataset(), self.seriesMax);

            return max;
        };

        self.calculateYPos = function(valueFunc, d) {
            if (!d.yPos) {
                d.yPos = 0;
            }

            d.yPos += valueFunc(d);

            return d.yPos;
        };

        self.xPosition = function(d) {
            return self.x.scale(self.keyFunction()(d));
        };

        self.calculateXPos = function(width, d) {
            if (!d.xPos) {
                d.xPos = self.xPosition(d);
            } else {
                d.xPos += width;
            }
            return d.xPos;
        };

        self.yPosition = function(d) {

            var seriesValueFunc = self.currentSeries.valueFunction;

            var position = self.stacked() ? self.y.scale(self.calculateYPos(seriesValueFunc, d)) : self.y.scale(seriesValueFunc(d));

            return position;
        };

        self.barWidth = function(d) {
            // comment for tom, this is the bit that is currently breaking the linear x axis, because d3 linear scales don't support the rangeBand() function, whereas ordinal ones do.
            // in js, you can separate the scale and range function using rangeBandFunction.call(self.x.scale, d), where rangeBandFunction can point to the appropriate function for the type of scale being used.
            return self.x.scale.rangeBand(d);
        };

        self.groupedBarWidth = function(d) {

            var groupWidth = self.barWidth(d);

            var width = self.stacked() || (self.series.length === 1) ? groupWidth : groupWidth / self.series.length;

            return width;
        };

        self.offsetXPosition = function(d) {
            var width = self.groupedBarWidth(d);
            var position = self.stacked() ? self.xPosition(d) : self.calculateXPos(width, d);

            return position;
        };

        self.seriesSpecificClassName = function(d) {

            var additionalClass = ' ' + self.currentSeries.name + 'class';
            var baseClassName = self.itemClassName(d);
            var itemClassName = baseClassName + additionalClass;

            return itemClassName;
        };

        self.draw = function(chart, drag) {

            self.initializeTooltip(chart.container.node());
            self.selectedItems = chart.selectedItems;

            var groupSelector = 'g.' + insight.Constants.BarGroupClass,
                barSelector = 'rect.' + insight.Constants.BarGroupClass;

            function reset(d) {
                d.yPos = 0;
                d.xPos = 0;
            }

            var data = self.dataset();

            data.forEach(reset);

            var groups = chart.plotArea
                .selectAll(groupSelector)
                .data(data, self.keyFunction());

            var newGroups = groups.enter()
                .append('g')
                .attr('class', insight.Constants.BarGroupClass);

            var newBars = newGroups.selectAll(barSelector);

            function barHeight(d) {
                var func = self.currentSeries.valueFunction;

                return (chart.height() - chart.margin().top - chart.margin().bottom) - self.y.scale(func(d));
            }

            function opacity() {
                // If we are using selected/notSelected, then make selected more opaque than notSelected
                if (this.classList && this.classList.contains("notselected")) {
                    return 0.5;
                }

                //If not using selected/notSelected, make everything semi-transparent
                return 1;
            }

            for (var seriesIndex in self.series) {

                self.currentSeries = self.series[seriesIndex];

                seriesName = self.currentSeries.name;
                seriesFunctions[seriesName] = self.currentSeries.valueFunction;

                var seriesSelector = '.' + seriesName + 'class.' + insight.Constants.BarClass;

                // Add any new bars

                newBars = newGroups.append('rect')
                    .attr('class', self.seriesSpecificClassName)
                    .attr('y', self.y.bounds[0])
                    .attr('height', 0)
                    .attr('in_series', seriesName)
                    .attr('fill', self.currentSeries.color)
                    .attr('clip-path', 'url(#' + chart.clipPath() + ')')
                    .on('mouseover', mouseOver)
                    .on('mouseout', self.mouseOut)
                    .on('click', click);

                // Select and update all bars
                var bars = groups.selectAll(seriesSelector);

                bars
                    .transition()
                    .duration(duration)
                    .attr('y', self.yPosition)
                    .attr('x', self.offsetXPosition)
                    .attr('width', self.groupedBarWidth)
                    .attr('height', barHeight)
                    .style('opacity', opacity);
            }

            // Remove groups no longer in the data set
            groups.exit().remove();
        };

        // Public functions -------------------------------------------------------------------------------------------

        /**
         * Determines whether the series should stack columns, or line them up side-by-side.
         * @memberof! insight.ColumnSeries
         * @instance
         * @returns {boolean} - To stack or not to stack.
         *
         * @also
         *
         * Sets whether the series should stack columns, or line them up side-by-side.
         * @memberof! insight.ColumnSeries
         * @instance
         * @param {boolean} stacked Whether the column series should be stacked.
         * @returns {this}
         */
        self.stacked = function(stack) {
            if (!arguments.length) {
                return stacked();
            }
            stacked = d3.functor(stack);
            return self;
        };

    };

    insight.ColumnSeries.prototype = Object.create(insight.Series.prototype);
    insight.ColumnSeries.prototype.constructor = insight.ColumnSeries;

})(insight);
