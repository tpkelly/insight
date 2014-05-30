var BaseChart = function BaseChart(name, element, dimension, data)
{
    var self = this;

    this.element = element;
    this.dimension = dimension;
    this.group = data;
    this._name = name;
    var displayName = d3.functor(name);

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();

    this._keyAccessor = function(d)
    {
        return d.key;
    };

    this._valueAccessor = function(d)
    {
        return d.value;
    };

    var height = d3.functor(300);
    var width = d3.functor(300);
    var stacked = d3.functor(false);
    var cumulative = d3.functor(false);
    var redrawAxes = d3.functor(false);
    var barPadding = d3.functor(0.2);
    var labelPadding = d3.functor(20);
    var labelFontSize = d3.functor("11px");
    var ordered = d3.functor(false);
    var orderable = d3.functor(false);
    var barColor = d3.functor('blue');
    var invert = d3.functor(false);
    var tickSize = d3.functor(0);
    var tickPadding = d3.functor(10);
    var yOrientation = d3.functor('left');
    var xOrientation = d3.functor('bottom');
    var tooltipLabel = d3.functor("Value");

    var yAxisFormat = function(d)
    {
        return d;
    };

    var xAxisFormat = function(d)
    {
        return d;
    };

    this._currentMax = 0;


    this.isFiltered = false;
    this.duration = 400;
    this.filters = [];
    this._linkedCharts = [];
    this._xRangeType = this.x.rangeRoundBands;
    this._yRangeType = this.y.range;
    this._barWidthFunction = this.x.rangeBand;


    this._margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };

    this._defaultSeries = {
        name: 'default',
        label: function()
        {
            return self.tooltipLabel();
        },
        calculation: self._valueAccessor,
        color: function(d)
        {
            //console.log(barColor);
            return barColor(d);
        }
    };

    var _series = [this._defaultSeries];
    var _targets = null;
    var _ranges = [];

    this._targetAccessor = function(d)
    {
        return d.value;
    };

    this.matcher = function(d)
    {
        return self._keyAccessor(d);
    };

    this._rangeAccessor = function(d)
    {
        return d.value;
    };

    this._limitFunction = function(d)
    {
        return true;
    };

    this._labelAccessor = function(d)
    {
        return d.key;
    };

    this._tooltipFormat = function(d)
    {
        return d;
    };



    this.xPosition = function(d)
    {
        var offset = Math.round((self._barWidthFunction == self.x.rangeBand || self._barWidthFunction == self.x.rangeRound) ? 0 : self.barWidth(d) / 2);

        return self.x(self._keyAccessor(d)) - offset;
    };

    this.yPosition = function(d)
    {
        return self.y(self._valueAccessor(d));
    };

    this.rangeY = function(d, i)
    {
        return self.y(self._rangeAccessor(d));
    };


    this.animationDuration = function(d, i)
    {
        return self.duration + (i);
    };

    this.rangeX = function(d, i)
    {
        var offset = i == (self.keys()
            .length - 1) ? self._barWidthFunction(d) : 0;

        return self.x(self._keyAccessor(d)) + offset;
    };

    this.barHeight = function(d)
    {
        return (self.height() - self.margin()
            .top - self.margin()
            .bottom) - self.y(self._valueAccessor(d));
    };

    this.targetY = function(d, i)
    {
        return self.y(self._targetAccessor(d));
    };

    this.targetX = function(d, i)
    {

        var offset = (self._barWidthFunction == self.x.rangeBand) ? 0 : self.barWidth(d) / 2;

        return (self.x(self._keyAccessor(d)) + self._barWidthFunction(d) / 3) - offset;
    };

    this.targetWidth = function(d)
    {
        return self._barWidthFunction(d) / 3;
    };

    this.targetTooltipText = function(d)
    {
        return self._tooltipFormat(self._targetAccessor(d));
    };

    this.tooltipText = function(d)
    {
        return self._tooltipFormat(self._valueAccessor(d));
    };

    this.yDomain = function()
    {
        return self.height() - self.margin()
            .top - self.margin()
            .bottom;
    };


    this.xDomain = function()
    {
        return self.width() - self.margin()
            .left - self.margin()
            .right;
    };

    this.xBounds = function(d)
    {

        var start = this.invert() ? this.margin()
            .right : this.margin()
            .left;
        var end = this.width() - (this.margin()
            .right + this.margin()
            .left);

        return {
            start: start,
            end: end
        };
    };

    this.yBounds = function(d)
    {

        var start = this.invert() ? this.margin()
            .top : this.margin()
            .bottom;

        var end = this.height() - (this.margin()
            .top + this.margin()
            .bottom);

        return {
            start: start,
            end: end
        };
    };

    this.createChart = function(ignoreTitle)
    {

        if (!ignoreTitle)
        {
            d3.select(this.element)
                .append("div")
                .attr('class', 'title')
                .text(this._displayName);
        }

        this.chart = d3.select(this.element)
            .append("svg")
            .attr("class", "chart");

        this.chart.attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chart.append("g")
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");

        this.applyOrderableHeader();

        this.tooltip();

        return this.chart;
    };

    this.calculateBarColor = function(d)
    {

        return barColor(d);
    };

    this.zoomable = function(_)
    {
        if (!arguments.length)
        {
            return this._zoomable;
        }
        this._zoomable = _;
        return this;
    };

    this.displayName = function(_)
    {
        if (!arguments.length)
        {
            return displayName();
        }
        displayName = d3.functor(_);
        return this;
    };

    this.yOrientation = function(_)
    {
        if (!arguments.length)
        {
            return yOrientation();
        }
        yOrientation = d3.functor(_);
        return this;
    };

    this.xOrientation = function(_)
    {
        if (!arguments.length)
        {
            return xOrientation();
        }
        xOrientation = d3.functor(_);
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

    this.orderable = function(_)
    {
        if (!arguments.length)
        {
            return orderable();
        }
        orderable = d3.functor(_);
        return this;
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

    this.orderChildren = function(_)
    {
        if (!arguments.length)
        {
            return this._orderChildren;
        }
        this._orderChildren = _;
        return this;
    };


    this.initZoom = function()
    {
        this.zoom = d3.behavior.zoom()
            .on("zoom", this.dragging.bind(this));

        this.zoom.x(this.x);

        this.chart.append("rect")
            .attr("class", "pane")
            .attr("width", this.width())
            .attr("height", this.yDomain())
            .on("click", self.clickEvent)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(this.zoom);
    };


    this.addClipPath = function()
    {

        this.chart.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 1)
            .attr("y", 0)
            .attr("width", this.width())
            .attr("height", this.yDomain());

    };

    this.dragging = function()
    {

        this.draw(true);
    };

    this.setXAxisRange = function(rangeAccessor)
    {
        this._xRangeType = rangeAccessor(this.x);
        return this;
    };

    this.initializeAxes = function()
    {
        //have to pass the chart as a variable as the sub functions are run in a different context
        this.initializeXAxis(this);
        this.initializeYAxis(this);
    };

    this.xDomainRange = function()
    {
        //default behaviour for x axis is to treat it as an orginal range using the dataset's keys
        return this.keys();
    };

    this.xRange = function(f)
    {
        if (!arguments.length)
        {
            return this.xDomainRange();
        }
        this.xDomainRange = f;
        return this;
    };

    this.initializeYAxis = function(chart)
    {
        this.applyYAxisRange.call(chart.y.domain([0, chart.findMax()]), chart, chart._yRangeType);
    };

    this.initializeXAxis = function(chart)
    {
        this.applyXAxisRange.call(chart.x.domain(chart.xDomainRange()), chart, chart._xRangeType);
    };

    this.applyXAxisRange = function(chart, f)
    {
        f.apply(this, [
            [0, chart.xDomain()], chart.barPadding()
        ]);
    };

    this.applyYAxisRange = function(chart, f)
    {
        f.apply(this, [
            [chart.yDomain(), 0], 0
        ]);
    };

    this.link = function(chart, follow)
    {

        if (this._linkedCharts.indexOf(chart) == -1)
        {
            this._linkedCharts.push(chart);

            if (follow)
            {
                this._linkedCharts.forEach(function(c)
                {
                    c.link(chart, false);
                });
            }
        }
        return this;
    };


    this.cumulative = function(_)
    {
        if (!arguments.length)
        {
            return cumulative();
        }
        cumulative = d3.functor(_);
        return this;
    };


    this.xAxisFormat = function(_)
    {
        if (!arguments.length)
        {
            return xAxisFormat;
        }
        xAxisFormat = _;
        return this;
    };



    this.updateMax = function(d)
    {
        var value = 0;

        var func;

        for (var seriesFunction in this.series())
        {
            func = this.cumulative() ? this.series()[seriesFunction].cumulative : this.series()[seriesFunction].calculation;
            value += func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }


        if (this.ranges()
            .length)
        {
            for (var rangeFunction in this.ranges())
            {
                func = this.ranges()[rangeFunction].calculation;
                value = func(d);
                this._currentMax = value > this._currentMax ? value : this._currentMax;
            }
        }
        return this._currentMax;
    };


    this.targetMax = function(d)
    {
        var value = 0;

        if (_targets)
        {
            func = this.cumulative() ? _targets.cumulative : _targets.calculation;
            value = func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }
        return this._currentMax;
    };

    this.findMax = function()
    {
        var self = this;

        var max = d3.max(this.dataset(), function(d)
        {
            return self.updateMax(d);
        });

        if (_targets)
        {
            var targetsmax = d3.max(_targets.data.getData(), function(d)
            {
                return self.targetMax(d);
            });
            max = max > targetsmax ? max : targetsmax;
        }

        this.maxUpdatedEvent(max);

        return max;
    };

    this.zeroValueEntry = function(d)
    {
        var hasValue = 0;
        var func;

        if (this.series()
            .length)
        {
            for (var seriesFunction in this.series())
            {
                func = this.cumulative() ? this.series()[seriesFunction].cumulative : this.series()[seriesFunction].calculation;

                hasValue = hasValue | (Math.round(func(d), 1) > 0);
            }
        }
        else
        {
            hasValue = hasValue | (Math.round(this._valueAccessor(d), 1) > 0);

        }
        if (_targets)
        {
            func = this.cumulative() ? _targets.cumulative : _targets.calculation;
            hasValue = hasValue | (Math.round(func(d), 1) > 0);
        }
        return hasValue;
    };



    this.keys = function()
    {
        var self = this;

        var keys = [];

        if (this.redrawAxes())
        {
            keys = this.dataset()
                .filter(function(d)
                {
                    return self.zeroValueEntry(d);
                })
                .map(this._keyAccessor);
        }
        else
        {
            keys = this.dataset()
                .map(this._keyAccessor);
        }
        return keys;
    };

    this.series = function(_)
    {

        if (!arguments.length)
        {
            return _series;
        }
        _series = _;
        return this;
    };

    this.stacked = function(_)
    {
        if (!arguments.length)
        {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.targets = function(targets)
    {
        if (!arguments.length)
        {
            return _targets;
        }
        _targets = targets;
        return this;
    };

    this.ranges = function(_)
    {
        if (!arguments.length)
        {
            return _ranges;
        }
        _ranges = _;
        return this;
    };

    this.toggleSortIcon = function()
    {

        var self = this;

        if (self.ordered())
        {
            d3.select(self.element)
                .select('.fa-arrow-up')
                .style('display', 'inline-block');
        }
        else
        {
            d3.select(self.element)
                .select('.fa-arrow-up')
                .style('display', 'none');
        }

    };

    this.titleClicked = function()
    {
        this.ordered(!this.ordered());

        this.toggleSortIcon.call(this);

        this.draw();

    };

    this.applyOrderableHeader = function()
    {

        var self = this;

        if (this.orderable())
        {

            var display = this.ordered() ? 'inline-block' : 'none';

            d3.select(this.element)
                .select("div.title")
                .style("cursor", "pointer")
                .on("click", this.titleClicked.bind(this))
                .append('div')
                .attr('class', 'order-icon fa fa-arrow-up')
                .style('display', display);
        }
    };

    this.topResults = function(_)
    {
        if (!arguments.length)
        {
            return this._topResults;
        }
        this._topResults = _;
        return this;
    };

    this.dataset = function()
    {
        var data = this.ordered() ? this.group.getOrderedData() : this.group.getData();

        return data.filter(this._limitFunction);
    };

    this.targetData = function()
    {
        return _targets.data.getData()
            .filter(this._limitFunction);
    };

    this.keyAccessor = function(_)
    {
        if (!arguments.length)
        {
            return this._keyAccessor;
        }
        this._keyAccessor = _;
        return this;
    };

    this.labelAccessor = function(_)
    {
        if (!arguments.length)
        {
            return this._labelAccessor;
        }
        this._labelAccessor = _;
        return this;
    };

    this.tooltipFormat = function(_)
    {
        if (!arguments.length)
        {
            return this._tooltipFormat;
        }
        this._tooltipFormat = _;
        return this;
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


    this.yAxisFormat = function(_)
    {
        if (!arguments.length)
        {
            return yAxisFormat;
        }
        yAxisFormat = _;
        return this;
    };


    this.valueAccessor = function(_)
    {
        if (!arguments.length)
        {
            return this._valueAccessor;
        }
        this._valueAccessor = _;
        this._defaultSeries.calculation = _;
        return this;
    };

    this.redrawAxes = function(_)
    {
        if (!arguments.length)
        {
            return redrawAxes();
        }
        redrawAxes = d3.functor(_);
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


    this.setXAxis = function(_)
    {

        if (!arguments.length)
        {
            return this.x;
        }
        this.x = _;
        return this;
    };

    this.invert = function(_)
    {

        if (!arguments.length)
        {
            return invert();
        }
        invert = d3.functor(_);
        return this;
    };

    this.setHover = function()
    {
        d3.select(this)
            .classed("active", true);
    };



    this.removeHover = function()
    {
        d3.select(this)
            .classed("active", false);
    };

    this.mouseOver = function(chart, item, d)
    {
        if (chart.hasTooltip)
        {
            var tipValue = $(item)
                .find('.tipValue')
                .first()
                .text();
            var tipLabel = $(item)
                .find('.tipLabel')
                .first()
                .text();

            chart.tip.show(
            {
                label: tipLabel,
                value: tipValue
            });
        }

        d3.select(item)
            .classed("active", true);
    };

    this.mouseOut = function(chart, item, d)
    {
        if (chart.hasTooltip)
        {
            chart.tip.hide(d);
        }

        d3.select(item)
            .classed("active", false);
    };


    this.isFunction = function(functionToCheck)
    {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    };

    this.labelColor = function(_)
    {
        if (!arguments.length)
        {
            return this._labelColor;
        }
        this._labelColor = _;
        return this;
    };

    this.barColor = function(_)
    {
        if (!arguments.length)
        {
            return barColor();
        }
        barColor = d3.functor(_);
        return this;
    };

    this.tooltipLabel = function(_)
    {
        if (!arguments.length)
        {
            return tooltipLabel();
        }
        tooltipLabel = d3.functor(_);
        return this;
    };

    this.tooltip = function()
    {
        var self = this;
        this.hasTooltip = true;

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


    this.filterKey = function() {};


    this.limit = function(_)
    {
        if (!arguments.length)
        {
            return this._limitFunction;
        }
        this._limitFunction = _;
        return this;
    };


    this.labelPadding = function(_)
    {
        if (!arguments.length)
        {
            return labelPadding();
        }
        labelPadding = d3.functor(_);
        return this;
    };

    this.labelFontSize = function(_)
    {
        if (!arguments.length)
        {
            return labelFontSize();
        }
        labelFontSize = d3.functor(_);
        return this;
    };


    this.labelAnchoring = function(d)
    {
        if (this.invert())
        {
            return "end";
        }
        else
        {
            return "start";
        }
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


    this.draw = function() {

    };

    this.init = function() {


    };

    this.triggerRedraw = function() {

    };

    this.filterEvent = function(dimension, filter) {

    };

    this.updateTargets = function() {};
    this.drawTargets = function() {};

    // Events 
    this.maxUpdatedEvent = function(max)
    {

        this._linkedCharts.forEach(function(chart)
        {

            chart._currentMax = chart._currentMax < max ? max : chart._currentMax;
        });
    };

    this.filterClick = function(element, filter)
    {
        if (this.dimension)
        {
            var filterFunction = this.filterFunction(filter, element);

            this.filterEvent(this.dimension, filterFunction);
        }
    };

    this.barWidth = function(d)
    {
        return self._barWidthFunction(d);
    };

};
