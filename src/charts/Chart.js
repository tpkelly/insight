function Chart(name, element, dimension)
{

    this.name = name;
    this.element = element;
    this.dimension = dimension;

    var height = d3.functor(300);
    var width = d3.functor(300);
    var zoomable = false;
    var zoomScale = null;
    this.container = null;

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
    var self = this;
    var barPadding = d3.functor(0.1);

    this.addAxis = function(axis)
    {
        axes.push(axis);
    };


    this.addClipPath = function()
    {
        this.chart.append("clipPath")
            .attr("id", this.clipPath())
            .append("rect")
            .attr("x", 1)
            .attr("y", 0)
            .attr("width", this.width() - this.margin()
                .left - this.margin()
                .right)
            .attr("height", this.height() - this.margin()
                .top - this.margin()
                .bottom);
    };

    this.init = function()
    {
        this.container = d3.select(this.element)
            .append('div')
            .attr('class', InsightConstants.ContainerClass)
            .style('width', this.width() + 'px')
            .style('position', 'relative');

        this.chart = this.container
            .append("svg")
            .attr("class", "chart");

        this.chart.attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chart.append("g")
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");

        this.addClipPath();

        scales.map(function(scale)
        {
            scale.initialize();
        });

        axes.map(function(axis)
        {
            axis.initialize();
        });

        if (zoomable)
        {
            this.initZoom();
        }

        this.tooltip();

        this.draw(false);
    };

    this.draw = function(dragging)
    {

        this.recalculateScales();

        axes.map(function(axis)
        {
            axis.draw(dragging);
        });

        this.series()
            .map(function(series)
            {
                series.draw(dragging);
            });
    };

    this.recalculateScales = function()
    {
        scales.map(function(scale)
        {
            var zx = zoomScale != scale;
            if (zx)
            {
                scale.calculateRange();
            }
        });
    };

    this.zoomable = function(scale)
    {
        zoomable = true;
        zoomScale = scale;
        return this;
    };

    this.initZoom = function()
    {
        this.zoom = d3.behavior.zoom()
            .on("zoom", self.dragging.bind(self));

        this.zoom.x(zoomScale.scale);

        if (!this.zoomExists())
        {
            this.chart.append("rect")
                .attr("class", "zoompane")
                .attr("width", this.width())
                .attr("height", this.height() - this.margin()
                    .top - this.margin()
                    .bottom)
                .style("fill", "none")
                .style("pointer-events", "all");
        }

        this.chart.select('.zoompane')
            .call(this.zoom);
    };

    this.zoomExists = function()
    {
        var z = this.chart.selectAll('.zoompane');
        return z[0].length;
    };

    this.dragging = function()
    {
        self.draw(true);
    };

    this.barPadding = function(_)
    {
        if (!arguments.length)
        {
            return barPadding();
        }
        barPadding = d3.functor(_);
        return this;
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

    this.clipPath = function()
    {

        return this.name.split(' ')
            .join('_') + "clip";
    };

    this.filterFunction = function(filter, element)
    {
        var value = filter.key ? filter.key : filter;

        return {
            name: value,
            element: element,
            filterFunction: function(d)
            {
                return String(d) == String(value);
            }
        };
    };

    this.filterClick = function(element, filter)
    {
        if (this.dimension)
        {
            var filterFunction = this.filterFunction(filter, element);

            this.filterEvent(this.dimension, filterFunction);
        }
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


    this.addHorizontalScale = function(type, typeString, direction)
    {
        var scale = new Scale(this, type, direction, typeString);
    };


    this.addHorizontalAxis = function(scale)
    {
        var axis = new Axis(this, scale, 'h', 'left');
    };

}
