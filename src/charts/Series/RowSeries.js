(function(insight) {
    /**
     * The RowSeries class extends the Series class and draws horizontal bars on a Chart
     * @class insight.RowSeries
     * @param {string} name - A uniquely identifying name for this chart
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     * @param {object} color - a string or function that defines the color to be used for the items in this series
     */
    insight.RowSeries = function RowSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        var self = this,
            stacked = d3.functor(false),
            seriesName = '',
            seriesFunctions = {};

        this.valueAxis = x;
        this.keyAxis = y;
        this.classValues = [insight.Constants.BarClass];

        this.series = [{
            name: 'default',
            valueFunction: function(d) {
                return self.valueFunction()(d);
            },
            tooltipValue: function(d) {
                return self.tooltipFunction()(d);
            },
            color: this.color,
            label: 'Value'
        }];


        /*
         * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
         * This function is mapped across the entire data array by the findMax method.
         * @memberof! insight.RowSeries
         * @instance
         * @param {object} data - An item in the object array to query
         * @returns {Number} - The maximum value within the range of the values for this series on the given axis.
         */
        this.seriesMax = function(d) {
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
         * @memberof! insight.RowSeries
         * @instance
         * @returns {Number} - The maximum value within the range of the values for this series on the given axis.
         */
        this.findMax = function() {
            var max = d3.max(self.dataset(), self.seriesMax);

            return max;
        };

        /**
         * Determines whether the series should stack rows, or line them up side-by-side.
         * @memberof! insight.RowSeries
         * @instance
         * @returns {boolean} - To stack or not to stack.
         *
         * @also
         *
         * Sets whether the series should stack rows, or line them up side-by-side.
         * @memberof! insight.RowSeries
         * @instance
         * @param {boolean} stacked Whether the row series should be stacked.
         * @returns {this}
         */
        this.stacked = function(_) {
            if (!arguments.length) {
                return stacked();
            }
            stacked = d3.functor(_);
            return this;
        };

        this.calculateXPos = function(func, d) {
            if (!d.xPos) {
                d.xPos = 0;
            }
            var myPosition = d.xPos;

            d.xPos += func(d);

            return myPosition;
        };

        this.yPosition = function(d) {
            return self.y.scale(self.keyFunction()(d));
        };

        this.calculateYPos = function(thickness, d) {
            if (!d.yPos) {
                d.yPos = self.yPosition(d);
            } else {
                d.yPos += thickness;
            }
            return d.yPos;
        };

        this.xPosition = function(d) {

            var func = self.currentSeries.valueFunction;

            var position = self.stacked() ? self.x.scale(self.calculateXPos(func, d)) : 0;

            return position;
        };

        this.barThickness = function(d) {
            return self.y.scale.rangeBand(d);
        };

        this.groupedbarThickness = function(d) {

            var groupThickness = self.barThickness(d);

            var width = self.stacked() || (self.series.length === 1) ? groupThickness : groupThickness / self.series.length;

            return width;
        };

        this.offsetYPosition = function(d) {
            var thickness = self.groupedbarThickness(d);
            var position = self.stacked() ? self.yPosition(d) : self.calculateYPos(thickness, d);

            return position;
        };

        this.barWidth = function(d) {
            var func = self.currentSeries.valueFunction;

            return self.x.scale(func(d));
        };


        var mouseOver = function(data, i) {

            var seriesName = this.getAttribute('in_series');
            var seriesFunction = seriesFunctions[seriesName];

            self.mouseOver.call(this, data, i, seriesFunction);
        };


        this.seriesSpecificClassName = function(d) {

            var additionalClass = ' ' + self.currentSeries.name + 'class';
            var baseClassName = self.itemClassName(d);
            var itemClassName = baseClassName + additionalClass;

            return itemClassName;
        };

        this.draw = function(chart, drag) {

            self.initializeTooltip(chart.container.node());
            self.selectedItems = chart.selectedItems;

            var reset = function(d) {
                d.yPos = 0;
                d.xPos = 0;
            };

            var data = this.dataset(),
                groupSelector = 'g.' + insight.Constants.BarGroupClass + '.' + this.name,
                groupClassName = insight.Constants.BarGroupClass + ' ' + this.name,
                barSelector = 'rect.' + insight.Constants.BarGroupClass;


            data.forEach(reset);


            var groups = chart.plotArea
                .selectAll(groupSelector)
                .data(data, this.keyvalueFunction);


            var newGroups = groups.enter()
                .append('g')
                .attr('class', groupClassName);

            var newBars = newGroups.selectAll(barSelector);

            var click = function(filter) {
                return self.click(this, filter);
            };

            var duration = function(d, i) {
                return 200 + (i * 20);
            };

            var opacity = function() {
                // If we are using selected/notSelected, then make selected more opaque than notSelected
                if (this.classList.contains("notselected"))
                    return 0.5;

                //If not using selected/notSelected, make everything semi-transparent
                return 1;
            };


            for (var seriesIndex in this.series) {

                this.currentSeries = this.series[seriesIndex];

                seriesName = this.currentSeries.name;
                seriesFunctions[seriesName] = this.currentSeries.valueFunction;

                var seriesSelector = '.' + seriesName + 'class.' + insight.Constants.BarClass;

                newBars = newGroups.append('rect')
                    .attr('class', self.seriesSpecificClassName)
                    .attr('height', 0)
                    .attr('fill', this.currentSeries.color)
                    .attr('in_series', seriesName)
                    .attr('clip-path', 'url(#' + chart.clipPath() + ')')
                    .on('mouseover', mouseOver)
                    .on('mouseout', this.mouseOut)
                    .on('click', click);

                var bars = groups.selectAll(seriesSelector)
                    .transition()
                    .duration(duration)
                    .attr('y', this.offsetYPosition)
                    .attr('x', this.xPosition)
                    .attr('height', this.groupedbarThickness)
                    .attr('width', this.barWidth)
                    .style('opacity', opacity);
            }

            groups.exit()
                .remove();
        };

        return this;
    };


    insight.RowSeries.prototype = Object.create(insight.Series.prototype);
    insight.RowSeries.prototype.constructor = insight.RowSeries;

})(insight);
