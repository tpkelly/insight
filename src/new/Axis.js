function Axis(chart, scale, type, anchor)
{
    this.chart = chart;
    this.scale = scale;
    this.anchor = anchor ? anchor : 'left';
    this.type = type;

    var self = this;

    var orientation = d3.functor("left");
    var tickSize = d3.functor(0);
    var tickPadding = d3.functor(10);
    var labelOrientation = d3.functor("lr");
    var textAnchor = d3.functor('end');

    var format = function(d)
    {
        return d;
    };

    this.chart.addAxis(this);

    this.format = function(_)
    {
        if (!arguments.length)
        {
            return format;
        }
        format = _;
        return this;
    };

    this.orientation = function(_)
    {
        if (!arguments.length)
        {
            return orientation();
        }
        orientation = d3.functor(_);
        return this;
    };

    this.tickSize = function(_)
    {
        if (!arguments.length)
        {
            return tickSize();
        }
        tickSize = d3.functor(_);
        return this;
    };

    this.tickPadding = function(_)
    {
        if (!arguments.length)
        {
            return tickPadding();
        }
        tickPadding = d3.functor(_);
        return this;
    };

    this.textAnchor = function(_)
    {
        if (!arguments.length)
        {
            return textAnchor();
        }
        textAnchor = d3.functor(_);
        return this;
    };

    this.labelOrientation = function(_)
    {
        if (!arguments.length)
        {
            return labelOrientation();
        }
        labelOrientation = d3.functor(_);
        return this;
    };


    this.initialize = function()
    {
        this.axis = d3.svg.axis()
            .scale(this.scale.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.format());
    };

    this.transform = function()
    {
        var transform = "translate(";

        if (self.scale.horizontal())
        {
            transform += '0,' + (self.chart.height() - self.chart.margin()
                .bottom - self.chart.margin()
                .top) + ')';
        }
        else if (self.scale.vertical())
        {
            transform += "0,0)";
        }

        return transform;
    };

    this.draw = function()
    {
        this.chart.chart.append('g')
            .attr('class', InsightConstants.AxisClass)
            .attr('transform', self.transform())
            .call(this.axis)
            .selectAll('text')
            .attr('class', InsightConstants.AxisTextClass)
            .style('text-anchor', self.textAnchor())
            .style('writing-mode', self.labelOrientation());
    };
}
