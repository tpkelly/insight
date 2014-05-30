function Chart(name, element)
{

    this.name = name;
    this.element = element;

    var height = d3.functor(300);
    var width = d3.functor(300);
    this.chart = null;

    this._margin = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };

    var series = [];
    var scales = [];
    var axes = [];

    this.addAxis = function(axis)
    {
        axes.push(axis);
    };

    this.init = function()
    {
        this.chart = d3.select(this.element)
            .append("svg")
            .attr("class", "chart");

        this.chart.attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chart.append("g")
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");


        for (var scale in scales)
        {
            var s = scales[scale];
            s.initialize();

        }

        for (var axis in axes)
        {
            var a = axes[axis];
            a.initialize();
        }

        this.tooltip();

        this.draw();
    };

    this.barPadding = function()
    {
        return 0.02;
    };

    this.margin = function(_)
    {
        if (!arguments.length)
        {
            return this._margin;
        }
        this._margin = _;
        return this;
    };

    this.tooltip = function()
    {

        this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d)
            {
                return "<span class='tiplabel'>" + d.label + ": </span><span class='tipvalue'>" + d.value + "</span>";
            });

        this.chart.call(this.tip);

        return this;
    };

    this.mouseOver = function(chart, item, d)
    {

        var tipValue = $(item)
            .find('.tipValue')
            .first()
            .text();

        var tipLabel = $(item)
            .find('.tipLabel')
            .first()
            .text();

        this.tip.show(
        {
            label: tipLabel,
            value: tipValue
        });

        d3.select(item)
            .classed("active", true);
    };

    this.mouseOut = function(chart, item, d)
    {

        this.tip.hide(d);

        d3.select(item)
            .classed("active", false);
    };

    this.width = function(_)
    {
        if (!arguments.length)
        {
            return width();
        }

        width = d3.functor(_);
        return this;
    };

    this.height = function(_)
    {
        if (!arguments.length)
        {
            return height();
        }
        height = d3.functor(_);
        return this;
    };

    this.series = function(_)
    {
        if (!arguments.length)
        {
            return series;
        }
        series = _;
    };


    this.scales = function(_)
    {
        if (!arguments.length)
        {
            return scales;
        }
        scales = _;
    };

    this.draw = function()
    {

        for (var series in this.series())
        {
            var s = this.series()[series];
            s.draw();
        }

        for (var axis in axes)
        {
            var a = axes[axis];
            a.draw();
        }


    };

    this.addHorizontalScale = function(type, typeString, direction)
    {

        var scale = new Scale(this, type, direction, typeString);

    };

    this.addHorizontalAxis = function(scale)
    {
        var axis = new Axis(this, scale, 'h', 'left');
    };

}
