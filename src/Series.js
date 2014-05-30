function Chart(name, element) {

    this.name = name;
    this.element = element;

    var height = d3.functor(300);
    var width = d3.functor(300);

    this._margin = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };

    var series = [];
    var scales = [];

    this.init = function() {
        this.chart = d3.select(this.element)
            .append("svg")
            .attr("class", "chart");

        this.chart.attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chart.append("g")
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");

        for (var scale in scales) {
            var s = scales[scale];
            s.initialize();
        }

        this.draw();
    };

    this.barPadding = function() {
        return 0.02;
    };

    this.margin = function(_) {
        if (!arguments.length) {
            return this._margin;
        }
        this._margin = _;
        return this;
    };

    this.width = function(_) {
        if (!arguments.length) {
            return width();
        }

        width = d3.functor(_);
        return this;
    };

    this.height = function(_) {
        if (!arguments.length) {
            return height();
        }
        height = d3.functor(_);
        return this;
    };

    this.series = function(_) {
        if (!arguments.length) {
            return series;
        }
        series = _;
    };


    this.scales = function(_) {
        if (!arguments.length) {
            return scales;
        }
        scales = _;
    };

    this.draw = function() {

        for (var series in this.series()) {
            var s = this.series()[series];
            s.draw();
        }
    };

}

function Series(name, chart, data, xScale, yScale, color) {

    this.chart = chart;
    this.data = data;
    this.xScale = xScale;
    this.yScale = yScale;
    this.name = name;
    this.color = d3.functor(color);

    xScale.addSeries(this);
    yScale.addSeries(this);

    this.draw = function() {

    };

    this.keyAccessor = function(d) {
        return d.key;
    };

    this.valueAccessor = function(d) {
        return d.value;
    };

    this.findMax = function() {};
}


function ColumnSeries(name, chart, data, xScale, yScale, color) {

    Series.call(this, name, chart, data, xScale, yScale, color);
    var self = this;
    var stacked = d3.functor(false);

    var barWidthFunction = this.xScale.rangeType;

    this.dataset = function() {
        var data = this.xScale.ordered() ? this.data.getOrderedData() : this.data.getData();

        return data;
    };

    this.findMax = function() {
        var self = this;

        var max = 0;

        for (var series in this.series) {
            var s = this.series[series];
            var data = this.data.getData();
            var m = d3.max(data, s.accessor);
            max = m > max ? m : max;
        }

        return max;
    };

    this.keys = function() {
        return this.dataset()
            .map(this.keyAccessor);
    };

    this.series = [{
        name: 'default',
        accessor: function(d) {
            return d.value;
        },
        color: d3.functor('silver'),
        label: 'Value'
    }];

    this.stacked = function(_) {
        if (!arguments.length) {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };

    this.xPosition = function(d) {
        return self.xScale.scale(self.keyAccessor(d));
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

        var position = self.stackedBars() ? self.yScale.scale(self.calculateYPos(self.valueAccessor, d)) : self.yScale.scale(self.valueAccessor(d));

        return position;
    };

    this.barWidth = function(d) {
        return self.xScale.scale.rangeBand(d);
    };

    this.groupedBarWidth = function(d) {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series.length == 1) ? groupWidth : groupWidth / self.series.length;

        return width;
    };

    this.offsetXPosition = function(d) {

        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.barHeight = function(d) {
        return (self.chart.height() - self.chart.margin()
            .top - self.chart.margin()
            .bottom) - self.yScale.scale(self.valueAccessor(d));
    };

    this.stackedBars = function() {
        return self.stacked();
    };

    this.matcher = this.keyAccessor;

    this.draw = function(drag) {

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var groups = this.chart.chart
            .selectAll('g.' + InsightConstants.BarGroupClass)
            .data(this.dataset(), this.matcher)
            .each(reset);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', InsightConstants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        for (var ser in this.series) {

            var s = this.series[ser];

            this.valueAccessor = s.accessor;

            newBars = newGroups.append('rect')
                .attr('class', s.name + 'class bar')
                .attr('y', this.yScale.bounds[0])
                .attr('height', 0)
                .attr('fill', s.color)
                .attr("clip-path", "url(#clip)");

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipTextClass);

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipLabelClass);

            var duration = drag ? 0 : 300;

            var bars = groups.selectAll('.' + s.name + 'class.bar')
                .transition()
                .duration(duration)
                .attr('y', this.yPosition)
                .attr('x', this.offsetXPosition)
                .attr('width', this.groupedBarWidth)
                .attr('height', this.barHeight);

        }
    };
}

ColumnSeries.prototype = Object.create(Series.prototype);
ColumnSeries.prototype.constructor = ColumnSeries;



function Scale(chart, scale, bounds, type) {

    var ordered = d3.functor(false);
    var self = this;
    this.scale = scale;
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.range;
    this.series = [];
    this.chart = chart;
    this.bounds = [];
    this.type = type;

    this.bounds = bounds;

    this.domain = function() {
        if (this.type == 'linear') {
            return [0, this.findMax()];
        } else if (this.type == 'ordinal') {
            return this.findOrdinalValues();
        }
    };

    this.findOrdinalValues = function() {
        var vals = [];

        for (var series in this.series) {
            var s = this.series[series];

            vals = s.keys();
        }

        return vals;
    };

    this.findMax = function() {

        var max = 0;

        for (var series in this.series) {
            var s = this.series[series];

            var m = s.findMax();

            max = m > max ? m : max;
        }

        return max;
    };

    this.addSeries = function(series) {
        this.series.push(series);
    };


    this.initialize = function() {
        this.applyAxisRange.call(this.scale.domain(this.domain()), this.rangeType);
    };

    this.applyAxisRange = function(rangeType) {
        rangeType.apply(this, [
            self.bounds, self.chart.barPadding()
        ]);
    };

    this.ordered = function(_) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(_);
        return this;
    };
}
