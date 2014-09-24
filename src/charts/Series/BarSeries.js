(function(insight) {

    /*
     * The BarSeries is an abstract base class for columns and rows.
     * @class insight.BarSeries
     * @extends insight.Series
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.BarSeries = function BarSeries(name, data, x, y) {

        insight.Series.call(this, name, data, x, y);

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Internal variables -------------------------------------------------------------------------------------------

        self.valueAxis = undefined;
        self.keyAxis = undefined;
        self.classValues = [insight.Constants.BarClass];

        // Private functions ------------------------------------------------------------------------------------------

        function tooltipFunction(d) {
            return self.tooltipFormat()(self.valueFunction()(d));
        }

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

        self.isHorizontal = function() {
            return undefined;
        };

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

            var height = (self.isHorizontal()) ? barBreadth : colBarLength;
            var width = (self.isHorizontal()) ? barLength : barBreadth;
            var xPosition = (self.isHorizontal()) ? 0 : keyPosition;
            var yPosition = (self.isHorizontal()) ? keyPosition : valuePosition;


            // Select and update all bars
            var seriesSelector = '.' + self.name + 'class.' + self.classValues[0];
            var bars = groups.selectAll(seriesSelector)
                .transition()
                .duration(duration)
                .attr('x', xPosition)
                .attr('y', yPosition)
                .attr('height', height)
                .attr('width', width)
                .style('opacity', opacity);

            groups.exit().remove();

            // draw helper functions ------------------------------------

            function groupHeight(d) {
                var w = self.keyAxis.scale.rangeBand(d);
                return w;
            }

            function barBreadth(d) {

                var heightOfGroup = groupHeight(d);
                var breadth = heightOfGroup / seriesTypeCount;
                return breadth;

            }

            function colBarLength(d) {
                return (chart.height() - chart.margin().top - chart.margin().bottom) - barLength(d);
            }

            function barLength(d) {

                var barValue = self.valueFunction()(d);
                var length = self.valueAxis.scale(barValue);
                return length;
            }

            function valuePosition(d) {
                var length = barLength(d);
                return length;
            }

            function keyPosition(d) {

                var groupPositions = self.keyAxis.scale.range();
                var groupPos = groupPositions[groupIndex];

                var barWidth = width(d);
                var position = groupPos + (barWidth * (seriesTypeCount - seriesIndex - 1));

                groupIndex++;

                return position;

            }
        };
    };

    insight.BarSeries.prototype = Object.create(insight.Series.prototype);
    insight.BarSeries.prototype.constructor = insight.BarSeries;
})(insight);
