function Scale(chart, scale, direction, type)
{

    var ordered = d3.functor(false);
    var self = this;
    this.scale = scale;
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.range;
    this.series = [];
    this.chart = chart;
    this.bounds = [];
    this.type = type;
    this.direction = direction;

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
    };

    this.calculateBounds = function()
    {
        if (self.horizontal())
        {
            self.bounds[0] = 0;
            self.bounds[1] = self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
        }
        else if (self.vertical())
        {
            self.bounds[1] = 0;
            self.bounds[0] = self.chart.height() - self.chart.margin()
                .top - self.chart.margin()
                .bottom;
        }
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
        this.applyAxisRange.call(this.scale.domain(this.domain()), this.rangeType);
    };

    this.applyAxisRange = function(rangeType)
    {
        self.calculateBounds();

        rangeType.apply(this, [
            self.bounds, self.chart.barPadding()
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
