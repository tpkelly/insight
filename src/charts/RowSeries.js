function RowSeries(name, chart, data, x, y, color) {

    Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var stacked = d3.functor(false);
    var seriesName = "";
    var tooltipExists = false;


    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };


    this.series = [{
        name: 'default',
        accessor: function(d) {
            return self.xFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor('silver'),
        label: 'Value'
    }];


    /**
     * RowSeries overrides the standard key function used by most, vertical charts.
     * @returns {object[]} return - The keys along the domain axis for this row series
     */
    this.keys = function() {
        return self.dataset()
            .map(self.yFunction());
    };


    this.tooltipFunction(function(d) {
        return self.tooltipFormat()(self.xFunction()(d));
    });


    /**
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
     * @returns {Number} return - Description
     * @param {object} data - An item in the object array to query
     */
    this.seriesMax = function(d) {
        var max = 0;
        var seriesMax = 0;

        var stacked = self.stacked();

        for (var series in self.series) {
            var s = self.series[series];

            var seriesValue = s.accessor(d);

            seriesMax = stacked ? seriesMax + seriesValue : seriesValue;

            max = seriesMax > max ? seriesMax : max;
        }

        return max;
    };


    /**
     * This method returns the largest value on the value axis of this ColumnSeries, checking all series functions in the series on all points.
     * This function is mapped across the entire data array by the findMax method.
     * @constructor
     * @returns {Number} return - The largest value on the value scale of this ColumnSeries
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * This method gets or sets whether or not the series in this ColumnSeries are to be stacked or not.  This is false by default.
     * @returns {boolean} - Whether or not the columns are stacked (they are grouped if this returns false)
     */
    /**
     * @returns {object} return - Description
     * @param {boolean} stack - To stack or not to stack
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
        return self.y.scale(self.yFunction()(d));
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

        var func = self.series[self.currentSeries].accessor;

        var position = self.stackedBars() ? self.x.scale(self.calculateXPos(func, d)) : 0;

        return position;
    };

    this.barThickness = function(d) {
        return self.y.scale.rangeBand(d);
    };

    this.groupedbarThickness = function(d) {

        var groupThickness = self.barThickness(d);

        var width = self.stackedBars() || (self.series.length == 1) ? groupThickness : groupThickness / self.series.length;

        return width;
    };

    this.offsetYPosition = function(d) {
        var thickness = self.groupedbarThickness(d);
        var position = self.stackedBars() ? self.yPosition(d) : self.calculateYPos(thickness, d);

        return position;
    };

    this.barWidth = function(d) {
        var func = self.series[self.currentSeries].accessor;

        return self.x.scale(func(d));
    };

    this.stackedBars = function() {
        return self.stacked();
    };

    this.className = function(d) {
        return seriesName + 'class bar ' + self.chart.dimensionSelector(d);
    };

    this.draw = function(drag) {
        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var groups = this.chart.chart
            .selectAll('g.' + InsightConstants.BarGroupClass)
            .data(this.dataset(), this.keyAccessor)
            .each(reset);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', InsightConstants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        var click = function(filter) {
            return self.chart.filterClick(this, filter);
        };

        var duration = function(d, i) {
            return 200 + (i * 20);
        };


        for (var ser in this.series) {

            this.currentSeries = ser;

            var s = this.series[ser];

            seriesName = s.name;

            newBars = newGroups.append('rect')
                .attr('class', self.className)
                .attr('height', 0)
                .attr('fill', s.color)
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut)
                .on('click', click);

            if (!tooltipExists) {
                newBars.append('svg:text')
                    .attr('class', InsightConstants.ToolTipTextClass);
                tooltipExists = true;
            }

            var bars = groups.selectAll('.' + seriesName + 'class.bar')
                .transition()
                .duration(duration)
                .attr('y', this.offsetYPosition)
                .attr('x', this.xPosition)
                .attr('height', this.groupedbarThickness)
                .attr('width', this.barWidth);

            bars.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(s.tooltipValue);
        }
    };

    return this;
}


RowSeries.prototype = Object.create(Series.prototype);
RowSeries.prototype.constructor = RowSeries;
