function StackedBarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();

    this.xFormatFunc = function(d) {
        return d;
    };

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient('left')
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self._yAxisFormat(d);
        });

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient('bottom')
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self.xFormatFunc(d);
        });

    this.xAxisFormat = function(f) {
        this.xFormatFunc = f;
        return this;
    };

    this.initializeAxes = function() {
        this.x.domain(this.keys())
            .rangeRoundBands([0, this.xDomain()], 0.2);

        this.y.domain([0, this.findMax()])
            .range([this.yDomain(), 0]);
    };

    this.addSeries = function(series) {

        if (!arguments.length) {
            return this._series;
        }
        this._series = series;
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

        var groups = this.chart
            .selectAll('g')
            .data(this.dataset());

        groups.enter()
            .append('g')
            .attr('class', 'bargroup');

        var bars = groups.selectAll('rect.bar');


        for (var seriesFunction in this._series) {
            this._valueAccessor = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            bars = groups.append('rect')
                .attr('class', self._series[seriesFunction].name + 'class bar')
                .attr('x', this.xPosition)
                .attr('y', this.yPosition)
                .attr('width', this.barWidth)
                .attr('height', this.barHeight)
                .attr('fill', this._series[seriesFunction].color)
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

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
            .style('text-anchor', 'end')
            .style('font-size', '12px')
            .style('fill', '#333');

        this.chart.append('g')
            .attr('transform', 'translate(0,' + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ')')
            .call(this.xAxis)
            .selectAll('text')
            .attr('class', 'x-axis')
            .style('font-size', '12px')
            .style('text-anchor', 'start')
            .style('writing-mode', 'tb')
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });

        if (this._targets) {
            this.drawTargets();
        }
    };


    this.draw = function() {

        var self = this;

        if (self.redrawAxes()) {
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

            var bars = groups.selectAll('.' + self._series[seriesFunction].name + 'class.bar')
                .transition()
                .duration(self.duration)
                .attr('x', this.xPosition)
                .attr('y', this.yPosition)
                .attr('height', this.barHeight);

            bars.selectAll('text.tipValue')
                .text(this.tooltipText);

            bars.selectAll('text.tipLabel')
                .text(this._series[seriesFunction].label);

        }

        if (this._targets) {
            this.updateTargets();
        }

        this.chart.selectAll('.y-axis')
            .call(this.yAxis)
            .selectAll('text')
            .style('font-size', '12px')
            .style('fill', '#333');
    };


    this.drawTargets = function() {

        var mouseOver = function(d, item) {
            self.mouseOver(self, this, d);
        };
        var mouseOut = function(d, item) {
            self.mouseOut(self, this, d);
        };

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

    this.updateTargets = function() {

        var groups = this.chart.selectAll('g')
            .data(this.targetData());

        if (this._targets) {

            this._valueAccessor = this.cumulative() ? self._targets.cumulative : self._targets.calculation;

            var tBars = groups.selectAll('rect.' + self._targets.name + 'class.target');

            tBars.transition()
                .duration(this.duration)
                .attr('y', this.targetY);

            tBars.selectAll('text.tipValue')
                .text(this.targetTooltipText)
                .attr('class', 'tipValue');
        }
    };

}


StackedBarChart.prototype = Object.create(BaseChart.prototype);
StackedBarChart.prototype.constructor = StackedBarChart;
