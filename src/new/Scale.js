function Scale(chart, scale, direction, type)
{

    var ordered = d3.functor(false);
    var self = this;
    this.scale = scale;
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.range;
    this.series = [];
    this.chart = chart;
    this.type = type;
    this.direction = direction;
    this.bounds = [];

    chart.scales()
        .push(this);

    this.domain = function()
    {
        if (this.type == 'linear')
        {
            return [0, this.findMax()];
        }
        else if (this.type == 'ordinal')
        {
            return this.findOrdinalValues();
        }
        if (this.type == 'time')
        {
            return [this.minTime(), this.maxTime()];
        }
    };

    this.calculateBounds = function()
    {
        var bounds = [];

        if (self.horizontal())
        {
            bounds[0] = 0;
            bounds[1] = self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
        }
        else if (self.vertical())
        {
            bounds[1] = 0;
            bounds[0] = self.chart.height() - self.chart.margin()
                .top - self.chart.margin()
                .bottom;
        }
        return bounds;
    };

    this.minTime = function()
    {
        var minTime = new Date(8640000000000000);

        for (var series in this.series)
        {
            var s = this.series[series];
            var cMin = d3.min(s.keys());
            minTime = cMin < minTime ? cMin : minTime;
        }

        return minTime;
    };


    this.maxTime = function()
    {
        var maxTime = new Date(-8640000000000000);

        for (var series in this.series)
        {
            var s = this.series[series];
            var cMax = d3.max(s.keys());
            maxTime = cMax > maxTime ? cMax : maxTime;
        }

        return maxTime;
    };


    this.findOrdinalValues = function()
    {
        var vals = [];

        for (var series in this.series)
        {
            var s = this.series[series];

            vals = s.keys();
        }

        return vals;
    };

    this.horizontal = function()
    {
        return this.direction == 'h';
    };

    this.vertical = function()
    {
        return this.direction == 'v';
    };


    this.findMax = function()
    {
        var max = 0;

        for (var series in this.series)
        {
            var s = this.series[series];

            var m = s.findMax();

            max = m > max ? m : max;
        }

        return max;
    };

    this.addSeries = function(series)
    {
        this.series.push(series);
    };


    this.initialize = function()
    {
        this.applyScaleRange.call(this.scale.domain(this.domain()), this.rangeType);
    };

    this.calculateRange = function()
    {
        this.scale.domain(this.domain());
    };

    this.applyScaleRange = function(rangeType)
    {
        var bounds = self.calculateBounds();

        this.bounds = bounds;

        rangeType.apply(this, [
            bounds, self.chart.barPadding()
        ]);
    };

    this.ordered = function(_)
    {
        if (!arguments.length)
        {
            return ordered();
        }
        ordered = d3.functor(_);
        return this;
    };
}
