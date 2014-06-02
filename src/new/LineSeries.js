function LineSeries(name, chart, data, x, y, color)
{

    Series.call(this, name, chart, data, x, y, color);

    var self = this;


    var mouseOver = function(d, item)
    {
        self.chart.mouseOver(self, this, d);
    };

    var mouseOut = function(d, item)
    {
        self.chart.mouseOut(self, this, d);
    };

    this.findMax = function()
    {
        var self = this;

        var max = 0;
        var data = this.data.getData();
        var m = d3.max(data, this.valueAccessor);

        max = m > max ? m : max;

        return max;
    };

    this.rangeY = function(d)
    {
        return self.y.scale(self.valueAccessor(d));
    };

    this.rangeX = function(d, i)
    {
        var val = 0;

        if (self.x.scale.rangeBand)
        {
            val = self.x.scale(self.keyAccessor(d)) + (self.x.scale.rangeBand() / 2);
        }
        else
        {

            val = self.x.scale(self.keyAccessor(d));
        }

        return val;
    };


    this.draw = function()
    {

        var transform = d3.svg.line()
            .x(self.rangeX)
            .y(self.rangeY)
            .interpolate('linear');

        var rangeIdentifier = "path." + this.name;

        var rangeElement = this.chart.chart.selectAll(rangeIdentifier);

        if (!this.rangeExists(rangeElement))
        {
            this.chart.chart.append("path")
                .attr("class", this.name)
                .attr("stroke", this.color)
                .attr("fill", "none");
        }

        this.chart.chart.selectAll(rangeIdentifier)
            .datum(this.dataset(), this.matcher)
            .transition()
            .duration(this.animationDuration)
            .attr("d", transform);


        var circles = this.chart.chart.selectAll("circle")
            .data(this.dataset());

        circles.enter()
            .append('circle')
            .attr('class', 'target-point')
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut);

        circles
            .transition()
            .duration(function(d, i)
            {
                return 600 + (i * 20);
            })
            .attr("cx", self.rangeX)
            .attr("cy", self.rangeY)
            .attr("r", 3.5);

        circles.append('svg:text')
            .attr('class', InsightConstants.ToolTipTextClass);

        circles.append('svg:text')
            .attr('class', InsightConstants.ToolTipLabelClass);

        circles.selectAll("." + InsightConstants.ToolTipTextClass)
            .text(this.valueAccessor);

        circles.selectAll("." + InsightConstants.ToolTipLabelClass)
            .text('Label');
    };

    this.rangeExists = function(rangeSelector)
    {

        return rangeSelector[0].length;
    };
}

LineSeries.prototype = Object.create(Series.prototype);
LineSeries.prototype.constructor = LineSeries;
