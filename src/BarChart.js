function BarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };

    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };

    this.calculateXPos = function(width, d) {
        if (!d.xPos) {
            d.xPos = self.xPosition(d);
        } else {
            d.xPos += width;
        }
        return d.xPos;
    };

    this.yPosition = function(d) {

        var position = self.stackedBars() ? self.y(self.calculateYPos(self._valueAccessor, d)) : self.y(self._valueAccessor(d));

        return position;
    };

    this.groupedBarWidth = function(d) {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series()
                .length == 1) ? groupWidth : groupWidth / self.series()
            .length;

        return width;
    };

    this.offsetXPosition = function(d) {

        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.stackedBars = function() {
        return self.stacked() || (this.series()
            .length == 1);
    };

    this.init = function() {

        var self = this;

        this.createChart();
        this.initializeAxes();

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient(self.yOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.yAxisFormat());

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient(self.xOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.xAxisFormat());

        this.addClipPath();

        if (this.zoomable()) {
            this.initZoom();
        }

        this.drawAxes();

        this.draw();
    };

    this.draw = function(dragging) {

        var self = this;

        if (dragging && self.redrawAxes()) {
            this.y.domain([0, d3.round(self.findMax(), 1)])
                .range([this.height() - this.margin()
                    .top - this.margin()
                    .bottom, 0
                ]);
        }

        this.drawRanges(InsightConstants.Behind);

        this.drawBars(dragging);

        this.drawRanges(InsightConstants.Front);

        this.drawTargets(dragging);

        this.updateAxes();
    };

    this.drawAxes = function() {

        this.chart.append('g')
            .attr('class', InsightConstants.YAxisClass)
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', InsightConstants.AxisTextClass);


        this.chart.append('g')
            .attr('class', InsightConstants.XAxisClass)
            .attr('transform', 'translate(0,' + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ')')
            .call(this.xAxis)
            .selectAll('text')
            .attr('class', InsightConstants.AxisTextClass)
            .style('text-anchor', 'start')
            .style('writing-mode', 'tb')
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });
    };




    this.drawRanges = function(filter) {

        var ranges = filter ? this.ranges()
            .filter(function(range) {
                return range.position == filter;
            }) : this.ranges();

        if (ranges) {
            for (var range in ranges) {

                this._rangeAccessor = ranges[range].calculation;

                var transform = ranges[range].type(this);

                var rangeIdentifier = "path." + ranges[range].class;

                var rangeElement = this.chart.selectAll(rangeIdentifier);

                if (!this.rangeExists(rangeElement)) {
                    this.chart.append("path")
                        .attr("class", ranges[range].class)
                        .attr("fill", ranges[range].color);
                }

                this.chart.selectAll(rangeIdentifier)
                    .datum(this.dataset(), this.matcher)
                    .transition()
                    .duration(this.animationDuration)
                    .attr("d", transform);
            }
        }
    };

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };

    this.drawBars = function(drag) {

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var groups = this.chart
            .selectAll('g.' + InsightConstants.BarGroupClass)
            .data(this.dataset(), this.matcher)
            .each(reset);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', InsightConstants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        for (var seriesFunction in this.series()) {

            this._valueAccessor = this.cumulative() ? this.series()[seriesFunction].cumulative : this.series()[seriesFunction].calculation;

            newBars = newGroups.append('rect')
                .attr('class', this.series()[seriesFunction].name + 'class bar')
                .attr('y', this.yDomain())
                .attr('height', 0)
                .attr('fill', this.series()[seriesFunction].color)
                .attr("clip-path", "url(#clip)")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipTextClass);

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipLabelClass);

            var duration = drag ? 0 : this.animationDuration;

            var bars = groups.selectAll('.' + this.series()[seriesFunction].name + 'class.bar')
                .transition()
                .duration(duration)
                .attr('y', this.yPosition)
                .attr('x', this.offsetXPosition)
                .attr('width', this.groupedBarWidth)
                .attr('height', this.barHeight);


            bars.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(this.tooltipText);

            bars.selectAll("." + InsightConstants.ToolTipLabelClass)
                .text(this.series()[seriesFunction].label);
        }
    };


    this.updateAxes = function() {

        var xaxis = this.chart.selectAll('g.x-axis')
            .call(this.xAxis);

        xaxis
            .selectAll("text")
            .style('text-anchor', 'start')
            .style('writing-mode', 'tb')
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });

        xaxis
            .selectAll("text:not(.selected)")
            .attr('class', 'x-axis axis-text');


        this.chart.selectAll('.y-axis')
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', 'axis-text');

    };

    this.drawTargets = function() {

        if (this.targets()) {

            this._targetAccessor = _targets.calculation;

            var targets = this.chart.selectAll("rect.target")
                .data(this.targetData(), this.matcher);

            var newTargets = targets
                .enter()
                .append("rect")
                .attr("class", "target " + _targets.name + "class")
                .on("mouseover", function(d) {
                    self.mouseOver(self, this);
                })
                .on("mouseout", function(d) {
                    self.mouseOut(self, this);
                });

            newTargets.append("svg:text")
                .text(this.targetTooltipText)
                .attr("class", InsightConstants.ToolTipTextClass);

            newTargets.append("svg:text")
                .text(_targets.label)
                .attr("class", InsightConstants.ToolTipLabelClass);

            targets
                .transition()
                .duration(this.animationDuration)
                .attr("x", this.targetX)
                .attr("y", this.targetY)
                .attr("width", this.targetWidth)
                .attr("height", 4)
                .attr("fill", _targets.color);


            targets.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(this.targetTooltipText)
                .attr("class", InsightConstants.ToolTipTextClass);
        }
    };
}


BarChart.prototype = Object.create(BaseChart.prototype);
BarChart.prototype.constructor = BarChart;
