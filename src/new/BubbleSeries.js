function BubbleSeries(name, chart, data, x, y, color)
{

    Series.call(this, name, chart, data, x, y, color);

    var radiusFunction = d3.functor(10);
    var fillFunction = d3.functor(color);
    var maxRad = d3.functor(50);
    var minRad = d3.functor(7);

    var self = this;

    var mouseOver = function(d, item)
    {
        self.chart.mouseOver(self, this, d);

        d3.select(this)
            .classed("hover", true);
    };

    var mouseOut = function(d, item)
    {
        self.chart.mouseOut(self, this, d);
    };

    this.rangeY = function(d)
    {
        var f = self.yFunction();

        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i)
    {
        var f = self.xFunction();
        return self.x.scale(self.xFunction()(d));
    };

    this.radiusFunction = function(_)
    {
        if (!arguments.length)
        {
            return radiusFunction;
        }
        radiusFunction = _;

        return this;
    };


    this.fillFunction = function(_)
    {
        if (!arguments.length)
        {
            return fillFunction;
        }
        fillFunction = _;

        return this;
    };


    this.draw = function(drag)
    {

        var selector = this.name + InsightConstants.Bubble;

        var duration = drag ? 0 : function(d, i)
        {
            return 200 + (i * 20);
        };

        var data = this.dataset();

        var min = d3.min(data, radiusFunction);
        var max = d3.max(data, radiusFunction);

        var rad = function(d)
        {
            return d.radius;
        };

        var click = function(filter)
        {
            return self.chart.filterClick(this, filter);
        };


        data.forEach(function(d)
        {
            var radiusInput = radiusFunction(d);

            d.radius = minRad() + (((radiusInput - min) * (maxRad() - minRad())) / (max - min));
        });

        //this sort ensures that smaller bubbles are on top of larger ones, so that they are always selectable.  Without changing original array
        data = data.concat()
            .sort(function(a, b)
            {
                return d3.descending(rad(a), rad(b));
            });

        var bubbles = this.chart.chart.selectAll('circle.' + selector)
            .data(data, this.matcher);

        bubbles.enter()
            .append('circle')
            .attr('class', selector + " " + InsightConstants.Bubble)
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut)
            .on('click', click);

        bubbles.transition()
            .duration(duration)
            .attr('r', rad)
            .attr('cx', self.rangeX)
            .attr('cy', self.rangeY)
            .attr('fill', fillFunction);

        bubbles.append('svg:text')
            .attr('class', InsightConstants.ToolTipTextClass);

        bubbles.append('svg:text')
            .attr('class', InsightConstants.ToolTipLabelClass);

        bubbles.selectAll("." + InsightConstants.ToolTipTextClass)
            .text(this.tooltipValue);

        bubbles.selectAll("." + InsightConstants.ToolTipLabelClass)
            .text(this.tooltipLabel);
    };
}

BubbleSeries.prototype = Object.create(Series.prototype);
BubbleSeries.prototype.constructor = BubbleSeries;
