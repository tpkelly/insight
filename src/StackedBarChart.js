function StackedBarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.xFormatFunc = function(d) {
        return d;
    };

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };



    this.xAxisFormat = function(f) {
        this.xFormatFunc = f;
        return this;
    };


    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };


    this.yPosition = function(d) {
        return this.y(this.calculateYPos(this._valueAccessor, d));
    }.bind(this);



    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient('left')
            .tickSize(0)
            .tickFormat(function(d) {
                return self._yAxisFormat(d);
            });

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient('bottom')
            .tickSize(0)
            .tickFormat(function(d) {
                return self.xFormatFunc(d);
            });

        this.addClipPath();

        if (this.zoomable()) {
            this.initZoom();
        }

        var groups = this.chart
            .selectAll('g')
            .data(this.dataset());

        var newGroups = groups.enter()
            .append('g')
            .attr('class', 'bargroup');

        var bars = newGroups.selectAll('rect.bar');

        for (var seriesFunction in this._series) {
            this._valueAccessor = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            bars = newGroups.append('rect')
                .attr('class', self._series[seriesFunction].name + 'class bar')
                .attr('x', this.xPosition)
                .attr('y', this.yDomain())
                .attr('width', this.barWidth)
                .attr('height', 0)
                .attr('fill', this._series[seriesFunction].color)
                .attr("clip-path", "url(#clip)")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            bars.transition()
                .duration(this.animationDuration)
                .attr('y', this.yPosition)
                .attr('height', this.barHeight);

            bars.append('svg:text')
                .text(this.tooltipText)
                .attr('class', 'tipValue');

            bars.append('svg:text')
                .text(this._series[seriesFunction].label)
                .attr('class', 'tipLabel');
        }

        this.chart.append('g')
            .attr('class', 'y-axis')
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', 'axis-text');

        this.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ')')
            .call(this.xAxis)
            .selectAll('text')
            .attr('class', 'x-axis axis-text')
            .style('text-anchor', 'start')
            .attr("transform", "rotate(90)")
            .attr("dx", "10")
            .attr("dy", "0")
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });

        if (this._targets) {
            this.drawTargets();
        }
    };


    this.draw = function(drag) {

        var self = this;

        if (drag && self.redrawAxes()) {
            this.y.domain([0, d3.round(self.findMax(), 1)])
                .range([this.height() - this.margin()
                    .top - this.margin()
                    .bottom, 0
                ]);
        }

        var groups = this.chart.selectAll('g.bargroup')
            .data(this.dataset())
            .each(function(d, i) {
                d.yPos = 0;
            });

        for (var seriesFunction in this._series) {

            this._valueAccessor = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            var duration = drag ? 0 : this.animationDuration;

            var bars = groups.selectAll('.' + self._series[seriesFunction].name + 'class.bar')
                .transition()
                .duration(duration)
                .attr('x', this.xPosition)
                .attr('y', this.yPosition)
                .attr('width', this.barWidth)
                .attr('height', this.barHeight);

            bars.selectAll('text.tipValue')
                .text(this.tooltipText);

            bars.selectAll('text.tipLabel')
                .text(this._series[seriesFunction].label);

        }

        if (this._targets) {
            this.updateTargets(drag);
        }

        var xaxis = this.chart.selectAll('g.x-axis')
            .call(this.xAxis);

        xaxis
            .selectAll("text")
            .style('text-anchor', 'start')
            .attr("transform", "rotate(90)")
            .attr("dx", "10")
            .attr("dy", "0")
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


        var groups = this.chart.selectAll('g')
            .data(this.targetData());

        if (this._targets) {

            this._targetAccessor = this.cumulative() ? self._targets.cumulative : self._targets.calculation;


            var tBars = groups.append('rect')
                .attr('class', this._targets.name + 'class target')
                .attr('x', this.targetX)
                .attr('y', this.targetY)
                .attr('width', this.targetWidth)
                .attr('height', 4)
                .attr('fill', this._targets.color)
                .attr("clip-path", "url(#clip)")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            tBars.append('svg:text')
                .text(this.targetTooltipText)
                .attr('class', 'tipValue');

            tBars.append('svg:text')
                .text(this._targets.label)
                .attr('class', 'tipLabel');
        }
    };

    this.updateTargets = function(drag) {

        var groups = this.chart.selectAll('g.bargroup')
            .data(this.targetData());

        if (this._targets) {

            this._valueAccessor = this.cumulative() ? self._targets.cumulative : self._targets.calculation;

            var tBars = groups.selectAll('rect.' + self._targets.name + 'class.target');

            var duration = drag ? 0 : this.animationDuration;

            tBars.transition()
                .duration(duration)
                .attr('x', this.targetX)
                .attr('width', this.targetWidth)
                .attr('y', this.targetY);

            tBars.selectAll('text.tipValue')
                .text(this.targetTooltipText)
                .attr('class', 'tipValue');
        }
    };

}


StackedBarChart.prototype = Object.create(BaseChart.prototype);
StackedBarChart.prototype.constructor = StackedBarChart;
