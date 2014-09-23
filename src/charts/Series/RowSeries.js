(function(insight) {

    /**
     * The RowSeries class extends the Series class and draws horizontal bars on a Chart
     * @class insight.RowSeries
     * @extends insight.Series
     * @param {String} name - A uniquely identifying name for this series
     * @param {DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     * @param {Object} color - a string or function that defines the color to be used for the items in this series
     */
    insight.RowSeries = function RowSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            barThicknessFunction = self.y.scale.rangeBand;

        // Internal variables -------------------------------------------------------------------------------------------

        self.valueAxis = x;
        self.keyAxis = y;
        self.classValues = [insight.Constants.BarClass];

        // Private functions ------------------------------------------------------------------------------------------

        function duration(d, i) {
            return 200 + (i * 20);
        }

        function opacity() {
            // If we are using selected/notSelected, then make selected more opaque than notSelected
            if (d3.select(this).classed('notselected')) {
                return 0.5;
            }

            //If not using selected/notSelected, make everything opaque
            return 1;
        }

        function seriesSpecificClassName(d) {

            var additionalClass = ' ' + self.name + 'class';
            var baseClassName = self.itemClassName(d);
            var itemClassName = baseClassName + additionalClass;

            return itemClassName;
        }

        // Internal functions -----------------------------------------------------------------------------------------

        self.draw = function(chart) {

            self.tooltip = chart.tooltip;
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
                .on('mouseover', self.mouseOver)
                .on('mouseout', self.mouseOut)
                .on('click', self.click);

            var seriesTypeCount = chart.countSeriesOfType(self);
            var seriesIndex = chart.seriesIndexByType(self);
            var groupIndex = 0;

            // Select and update all bars
            var seriesSelector = '.' + self.name + 'class.' + insight.Constants.BarClass;
            var bars = groups.selectAll(seriesSelector)
                .transition()
                .duration(duration)
                .attr('y', yPosition)
                .attr('x', 0)
                .attr('height', barHeight)
                .attr('width', barWidth)
                .style('opacity', opacity);

            groups.exit().remove();

            // draw helper functions ------------------------------------

            function groupHeight(d) {
                var w = self.keyAxis.scale.rangeBand(d);
                return w;
            }

            function barHeight(d) {

                var widthOfGroup = groupHeight(d);
                var width = widthOfGroup / seriesTypeCount;
                return width;

            }

            function barWidth(d) {

                var barValue = self.valueFunction()(d);
                var height = self.valueAxis.scale(barValue);


                return height;
            }

            function yPosition(d) {

                var groupPositions = self.keyAxis.scale.range();
                var groupY = groupPositions[groupIndex];

                var heightOfBar = barHeight(d);
                var position = groupY + (heightOfBar * (seriesTypeCount - seriesIndex - 1));

                groupIndex++;

                return position;

            }

        };

    };

    insight.RowSeries.prototype = Object.create(insight.Series.prototype);
    insight.RowSeries.prototype.constructor = insight.RowSeries;

})(insight);
