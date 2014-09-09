(function(insight) {

    /**
     * The ColumnSeries class extends the Series class and draws vertical bars on a Chart
     * @class insight.ColumnSeries
     * @param {string} name - A uniquely identifying name for this series
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.ColumnSeries = function ColumnSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables -----------------------------------------------------------------------------------------

        var self = this;

        // Internal variables ------------------------------------------------------------------------------------------

        self.classValues = [insight.Constants.BarClass];

        // Private functions -----------------------------------------------------------------------------------------

        function tooltipFunction(d) {
            return self.tooltipFormat()(self.valueFunction()(d));
        }

        function click(filter) {
            return self.click(self, filter);
        }

        function duration(d, i) {
            return 200 + (i * 20);
        }

        function mouseOver(data, i) {
            var seriesName = this.getAttribute('in_series');

            self.mouseOver.call(this, data, i, self.valueFunction());
        }

        function opacity() {
            // If we are using selected/notSelected, then make selected more opaque than notSelected
            if (this.classList && this.classList.contains("notselected")) {
                return 0.5;
            }

            //If not using selected/notSelected, make everything opaque
            return 1;
        }

        // Internal functions ----------------------------------------------------------------------------------------

        self.orderFunction = function(a, b) {
            // Sort descending for categorical data
            return self.valueFunction()(b) - self.valueFunction()(a);
        };

        self.draw = function(chart, isDragging) {

            self.initializeTooltip(chart.container.node());
            self.selectedItems = chart.selectedItems;

            var groupSelector = 'g.' + self.name + '.' + insight.Constants.BarGroupClass,
                barSelector = 'rect.' + self.name + '.' + insight.Constants.BarGroupClass;

            var data = self.dataset();

            var groups = chart.plotArea
                .selectAll(groupSelector)
                .data(data, self.keyFunction());

            var newGroups = groups.enter()
                .append('g')
                .classed(self.name, true)
                .classed(insight.Constants.BarGroupClass, true);

            var newBars = newGroups.selectAll(barSelector);

            newBars = newGroups.append('rect')
                .attr('class', self.itemClassName)
                .attr('in_series', self.name)
                .attr('fill', self.color)
                .attr('clip-path', 'url(#' + chart.clipPath() + ')')
                .on('mouseover', mouseOver)
                .on('mouseout', self.mouseOut)
                .on('click', click);

            var seriesTypeCount = chart.countSeriesOfType(self);
            var seriesIndex = chart.seriesIndexByType(self);
            var groupIndex = 0;

            // Select and update all bars
            var seriesSelector = '.' + self.name + 'class.' + insight.Constants.BarClass;
            var bars = groups.selectAll(seriesSelector);

            bars
                .transition()
                .duration(duration)
                .attr('y', yPosition)
                .attr('x', xPosition)
                .attr('width', barWidth)
                .attr('height', barHeight)
                .style('opacity', opacity);

            // Remove groups no longer in the data set
            groups.exit().remove();

            // draw helper functions ----------------------------------

            function barHeight(d) {

                var barValue = self.valueFunction()(d);
                var height = (chart.height() - chart.margin().top - chart.margin().bottom) - self.y.scale(barValue);

                return height;
            }

            function groupWidth(d) {
                var w = self.x.scale.rangeBand(d);
                return w;
            }

            function barWidth(d) {

                var widthOfGroup = groupWidth(d);
                var width = widthOfGroup / seriesTypeCount;
                return width;

            }

            function xPosition(d) {

                var groupPositions = self.keyAxis.scale.range();
                var groupX = groupPositions[groupIndex];

                var widthOfBar = barWidth(d);
                var position = groupX + (widthOfBar * seriesIndex);

                groupIndex++;

                return position;

            }

            function yPosition(d) {
                var position = self.y.scale(self.valueFunction()(d));
                return position;
            }

        };

    };

    insight.ColumnSeries.prototype = Object.create(insight.Series.prototype);
    insight.ColumnSeries.prototype.constructor = insight.ColumnSeries;

})(insight);
