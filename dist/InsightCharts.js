function Group(data)
{
    this._data = data;
    this._cumulative = false;

    this._valueAccessor = function(d)
    {
        return d;
    };

    this._orderFunction = function(a, b)
    {
        return b.value - a.value;
    };

    this._ordered = false;
}

Group.prototype.filterFunction = function(f)
{
    if (!arguments.length)
    {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Group.prototype.cumulative = function(c)
{
    if (!arguments.length)
    {
        return this._cumulative;
    }
    this._cumulative = c;
    return this;
};

Group.prototype.getData = function()
{
    var data;
    if (this._data.all)
    {
        data = this._data.all();
    }
    else
    {
        //not a crossfilter set
        data = this._data;
    }

    if (this._filterFunction)
    {
        data = data.filter(this._filterFunction);
    }

    return data;
};

Group.prototype.getOrderedData = function()
{
    var data;

    if (this._data.all)
    {
        data = data = this._data.top(Infinity)
            .sort(this.orderFunction());
    }
    else
    {
        data = this._data.sort(this.orderFunction());
    }

    if (this._filterFunction)
    {
        data = data.filter(this._filterFunction);
    }

    return data;
};


Group.prototype.computeFunction = function(c)
{
    this._ordered = true;
    if (!arguments.length)
    {
        return this._compute;
    }
    this._compute = c;
    return this;
};


Group.prototype.orderFunction = function(o)
{
    if (!arguments.length)
    {
        return this._orderFunction;
    }
    this._orderFunction = o;
    return this;
};

Group.prototype.compute = function()
{
    this._compute();
};

Group.prototype.valueAccessor = function(v)
{
    if (!arguments.length)
    {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};


Group.prototype.calculateTotals = function()
{
    if (this._cumulative)
    {
        var totals = {};
        var total = 0;
        var self = this;
        var data = this._ordered ? this.getOrderedData() : this.getData();

        data
            .forEach(function(d, i)
            {

                var value = self._valueAccessor(d);

                if (typeof(value) != "object")
                {
                    total += value;
                    d.Cumulative = total;
                }
                else
                {
                    for (var property in value)
                    {
                        var totalName = property + 'Cumulative';

                        if (totals[totalName])
                        {
                            totals[totalName] += value[property];
                            value[totalName] = totals[totalName];
                        }
                        else
                        {
                            totals[totalName] = value[property];
                            value[totalName] = totals[totalName];
                        }
                    }
                }
            });
    }
    return this;
};


function SimpleGroup(data)
{
    this._data = data;
    this._orderFunction = function(a, b)
    {
        return b.values - a.values;
    };
}
SimpleGroup.prototype = Object.create(Group.prototype);
SimpleGroup.prototype.constructor = SimpleGroup;

SimpleGroup.prototype.getOrderedData = function()
{
    return this._data.sort(this._orderFunction);
};

SimpleGroup.prototype.getData = function()
{
    return this._data;
};

function NestedGroup(dimension, nestFunction)
{
    this._dimension = dimension;
    this._data = dimension.Dimension.bottom(Infinity);
    this._nestFunction = nestFunction;
    this._nestedData = nestFunction.entries(this._data);
}


NestedGroup.prototype = Object.create(Group.prototype);
NestedGroup.prototype.constructor = NestedGroup;


NestedGroup.prototype.getData = function()
{
    return this._nestedData;
};

NestedGroup.prototype.updateNestedData = function()
{
    this._data = this._dimension.Dimension.bottom(Infinity);
    this._nestedData = this._nestFunction.entries(this._data);
};


NestedGroup.prototype.getOrderedData = function()
{
    return this._nestedData;
};
;function Grouping(dimension)
{
    this._cumulative = false;

    this.dimension = dimension;

    var sumProperties = [];
    var countProperties = [];
    var averageProperties = [];

    this._valueAccessor = function(d)
    {
        return d;
    };

    this._orderFunction = function(a, b)
    {
        return b.value - a.value;
    };

    this._ordered = false;

    this.sum = function(_)
    {
        if (!arguments.length)
        {
            return sumProperties;
        }
        sumProperties = _;
        return this;
    };

    this.count = function(_)
    {
        if (!arguments.length)
        {
            return countProperties;
        }
        countProperties = _;
        return this;
    };

    this.average = function(_)
    {
        if (!arguments.length)
        {
            return averageProperties;
        }
        averageProperties = _;

        sumProperties = this.unique(sumProperties.concat(averageProperties));

        return this;
    };

    return this;
}

Grouping.prototype.filterFunction = function(f)
{
    if (!arguments.length)
    {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Grouping.prototype.cumulative = function(c)
{
    if (!arguments.length)
    {
        return this._cumulative;
    }
    this._cumulative = c;
    return this;
};

Grouping.prototype.unique = function(array)
{
    var a = array.concat();
    for (var i = 0; i < a.length; ++i)
    {
        for (var j = i + 1; j < a.length; ++j)
        {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

Grouping.prototype.initialize = function()
{
    var propertiesToSum = this.sum();
    var propertiesToCount = this.count();
    var propertiesToAverage = this.average();

    var data = this.dimension.Dimension.group()
        .reduce(
            function(p, v)
            {
                p.Count++;

                for (var property in propertiesToSum)
                {
                    if (v.hasOwnProperty(propertiesToSum[property]))
                    {
                        p[propertiesToSum[property]].Sum += v[propertiesToSum[property]];
                    }
                }

                for (var avProperty in propertiesToAverage)
                {
                    if (v.hasOwnProperty(propertiesToAverage[avProperty]))
                    {
                        p[propertiesToAverage[avProperty]].Average = p[propertiesToAverage[avProperty]].Average + ((v[propertiesToAverage[avProperty]] - p[propertiesToAverage[avProperty]].Average) / p.Count);
                    }
                }

                for (var countProp in propertiesToCount)
                {
                    if (v.hasOwnProperty(propertiesToCount[countProp]))
                    {
                        p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] = p[propertiesToCount[countProp]].hasOwnProperty(v[propertiesToCount[countProp]]) ? p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] + 1 : 1;
                        p[propertiesToCount[countProp]].Total++;
                    }
                }

                return p;
            },
            function(p, v)
            {
                p.Count--;

                for (var property in propertiesToSum)
                {
                    if (v.hasOwnProperty(propertiesToSum[property]))
                    {
                        p[propertiesToSum[property]].Sum -= v[propertiesToSum[property]];
                    }
                }


                for (var countProp in propertiesToCount)
                {
                    if (v.hasOwnProperty(propertiesToCount[countProp]))
                    {
                        p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] = p[propertiesToCount[countProp]].hasOwnProperty(v[propertiesToCount[countProp]]) ? p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] - 1 : 1;
                        p[propertiesToCount[countProp]].Total--;
                    }
                }

                for (var avProperty in propertiesToAverage)
                {
                    if (v.hasOwnProperty(propertiesToAverage[avProperty]))
                    {
                        var valRemoved = v[propertiesToAverage[avProperty]];
                        var sum = p[propertiesToAverage[avProperty]].Sum;
                        p[propertiesToAverage[avProperty]].Average = sum / p.Count;

                        var result = p[propertiesToAverage[avProperty]].Average;

                        if (!isFinite(result))
                        {
                            p[propertiesToAverage[avProperty]].Average = 0;
                        }
                    }
                }


                return p;
            },
            function()
            {
                var p = {
                    Count: 0
                };

                for (var property in propertiesToSum)
                {
                    p[propertiesToSum[property]] = p[propertiesToSum[property]] ? p[propertiesToSum[property]] :
                    {};
                    p[propertiesToSum[property]].Sum = 0;
                }
                for (var avProperty in propertiesToAverage)
                {
                    p[propertiesToAverage[avProperty]] = p[propertiesToAverage[avProperty]] ? p[propertiesToAverage[avProperty]] :
                    {};
                    p[propertiesToAverage[avProperty]].Average = 0;
                }
                for (var countProp in propertiesToCount)
                {
                    p[propertiesToCount[countProp]] = p[propertiesToCount[countProp]] ? p[propertiesToCount[countProp]] :
                    {};
                    p[propertiesToCount[countProp]].Total = 0;
                }
                return p;
            }
        );

    this._data = data;

    return this;
};




Grouping.prototype.getData = function()
{
    var data;
    if (this._data.all)
    {
        data = this._data.all();
    }
    else
    {
        //not a crossfilter set
        data = this._data;
    }

    if (this._filterFunction)
    {
        data = data.filter(this._filterFunction);
    }

    return data;
};

Grouping.prototype.getOrderedData = function()
{
    var data;

    if (this._data.all)
    {
        data = data = this._data.top(Infinity)
            .sort(this.orderFunction());
    }
    else
    {
        data = this._data.sort(this.orderFunction());
    }

    if (this._filterFunction)
    {
        data = data.filter(this._filterFunction);
    }

    return data;
};


Grouping.prototype.computeFunction = function(c)
{
    this._ordered = true;
    if (!arguments.length)
    {
        return this._compute;
    }
    this._compute = c;
    return this;
};


Grouping.prototype.orderFunction = function(o)
{
    if (!arguments.length)
    {
        return this._orderFunction;
    }
    this._orderFunction = o;
    return this;
};

Grouping.prototype.compute = function()
{
    this._compute();
};

Grouping.prototype.valueAccessor = function(v)
{
    if (!arguments.length)
    {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};


Grouping.prototype.calculateTotals = function()
{
    if (this._cumulative)
    {
        var totals = {};
        var total = 0;
        var self = this;
        var data = this._ordered ? this.getOrderedData() : this.getData();

        data
            .forEach(function(d, i)
            {

                var value = self._valueAccessor(d);

                if (typeof(value) != "object")
                {
                    total += value;
                    d.Cumulative = total;
                }
                else
                {
                    for (var property in value)
                    {
                        var totalName = property + 'Cumulative';

                        if (totals[totalName])
                        {
                            totals[totalName] += value[property];
                            value[totalName] = totals[totalName];
                        }
                        else
                        {
                            totals[totalName] = value[property];
                            value[totalName] = totals[totalName];
                        }
                    }
                }
            });
    }
    return this;
};
;var Dimension = function Dimension(name, func, dimension, displayFunction)
{
    this.Dimension = dimension;
    this.Name = name;
    this.Filters = [];
    this.Function = func;

    this.displayFunction = displayFunction ? displayFunction : function(d)
    {
        return d;
    };

    this.comparer = function(d)
    {
        return d.Name == this.Name;
    }.bind(this);
};
;var InsightFormatters = (function(d3)
{
    var exports = {};


    exports.moduleProperty = 1;

    exports.currencyFormatter = function(value)
    {
        var format = d3.format(",f");
        return '£' + format(value);
    };

    exports.dateFormatter = function(value)
    {
        var format = d3.time.format("%b %Y");
        return format(value);
    };

    exports.percentageFormatter = function(value)
    {
        var format = d3.format("%");
        return format(value);
    };

    return exports;
}(d3));
;var InsightConstants = (function()
{
    var exports = {};

    exports.Behind = 'behind';
    exports.Front = 'front';
    exports.AxisTextClass = 'axis-text';
    exports.AxisLabelClass = 'axis-label';
    exports.YAxisClass = 'y-axis';
    exports.AxisClass = 'in-axis';
    exports.XAxisClass = 'x-axis';
    exports.XAxisRotation = "rotate(90)";
    exports.ToolTipTextClass = "tipValue";
    exports.ToolTipLabelClass = "tipLabel";
    exports.BarGroupClass = "bargroup";
    exports.Bubble = "bubble";
    return exports;
}());
;function Series(name, chart, data, x, y, color)
{

    this.chart = chart;
    this.data = data;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = d3.functor(color);
    this.animationDuration = 300;

    x.addSeries(this);
    y.addSeries(this);

    var self = this;
    var cssClass = "";

    var tooltipFormat = function(d)
    {
        return d;
    };



    var xFunction = function(d)
    {
        return d.key;
    };

    var yFunction = function(d)
    {
        return d.value;
    };

    var tooltipFunction = yFunction;

    var tooltipLabel = d3.functor("Label");

    this.dataset = function()
    {
        //won't always be x that determins this (rowcharts, bullets etc.), need concept of ordering by data scale?
        var data = this.x.ordered() ? this.data.getOrderedData() : this.data.getData();

        return data;
    };



    this.keys = function()
    {
        return this.dataset()
            .map(xFunction);
    };

    this.cssClass = function(_)
    {
        if (!arguments.length)
        {
            return cssClass;
        }
        cssClass = _;
        return this;
    };

    this.keyAccessor = function(d)
    {
        return d.key;
    };

    this.xFunction = function(_)
    {
        if (!arguments.length)
        {
            return xFunction;
        }
        xFunction = _;

        return this;
    };

    this.yFunction = function(_)
    {
        if (!arguments.length)
        {
            return yFunction;
        }
        yFunction = _;

        return this;
    };

    this.tooltipFunction = function(_)
    {
        if (!arguments.length)
        {
            return tooltipFunction;
        }
        tooltipFunction = _;

        return this;
    };

    this.tooltipValue = function(d)
    {
        return tooltipFormat(tooltipFunction(d));
    };

    this.tooltipLabel = function(d)
    {
        return tooltipLabel(d);
    };

    this.tooltipLabelFormat = function(_)
    {

        if (!arguments.length)
        {
            return tooltipLabel;
        }
        tooltipLabel = d3.functor(_);
        return this;
    };

    this.tooltipFormat = function(_)
    {
        if (!arguments.length)
        {
            return tooltipFormat;
        }
        tooltipFormat = _;
        return this;
    };

    this.matcher = this.keyAccessor;

    this.findMax = function(scale)
    {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };

    this.draw = function() {};

    return this;
}
;function Chart(name, element, dimension)
{

    this.name = name;
    this.element = element;
    this.dimension = dimension;

    var height = d3.functor(300);
    var width = d3.functor(300);
    var zoomable = false;
    var zoomScale = null;

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
        this.chart = d3.select(this.element)
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
;function BubbleSeries(name, chart, data, x, y, color)
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
;function Scale(chart, title, scale, direction, type)
{
    var ordered = d3.functor(false);
    var self = this;
    this.scale = scale;
    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.rangeRound;
    this.series = [];
    this.title = title;
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

        this.series.map(function(series)
        {
            var cMin = d3.min(series.keys());
            minTime = cMin < minTime ? cMin : minTime;
        });
        return minTime;
    };


    this.maxTime = function()
    {
        var maxTime = new Date(-8640000000000000);

        this.series.map(function(series)
        {
            var cMax = d3.max(series.keys());
            maxTime = cMax > maxTime ? cMax : maxTime;
        });

        return maxTime;
    };


    this.findOrdinalValues = function()
    {
        var vals = [];

        this.series.map(function(series)
        {
            vals = series.keys();
        });

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

        this.series.map(function(series)
        {
            var m = series.findMax(self);

            max = m > max ? m : max;
        });

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

        self.bounds = bounds;

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
;function Axis(chart, name, scale, anchor)
{
    this.chart = chart;
    this.scale = scale;
    this.anchor = anchor ? anchor : 'left';
    this.name = name;

    var self = this;

    var tickSize = d3.functor(0);
    var tickPadding = d3.functor(10);
    var labelOrientation = d3.functor("lr");
    var orientation = scale.horizontal() ? d3.functor(this.anchor) : d3.functor(this.anchor);
    var textAnchor;

    if (scale.vertical())
    {
        textAnchor = this.anchor == 'left' ? 'end' : 'start';
    }
    if (scale.horizontal())
    {
        textAnchor = 'start';
    }

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
            return textAnchor;
        }
        textAnchor = _;
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

    this.tickRotation = function()
    {
        var offset = self.tickPadding() + (self.tickSize() * 2);

        var rotation = this.labelOrientation() == 'tb' ? 'rotate(90,0,' + offset + ')' : '';

        return rotation;
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
            var xShift = self.anchor == 'left' ? 0 : self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
            transform += xShift + ",0)";
        }

        return transform;
    };

    this.labelHorizontalPosition = function()
    {
        var pos = "";

        if (self.scale.horizontal())
        {

        }
        else if (self.scale.vertical())
        {

        }

        return pos;
    };

    this.labelVerticalPosition = function()
    {
        var pos = "";

        if (self.scale.horizontal())
        {

        }
        else if (self.scale.vertical())
        {

        }

        return pos;
    };

    this.positionLabels = function(labels)
    {

        if (self.scale.horizontal())
        {
            labels.style('left', 0)
                .style('bottom', 0)
                .style('width', '100%')
                .style('text-align', 'center');
        }
        else if (self.scale.vertical())
        {
            labels.style('left', '0')
                .style('top', '35%');
        }
    };

    this.initialize = function()
    {
        this.axis = d3.svg.axis()
            .scale(this.scale.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.format());

        this.chart.chart.append('g')
            .attr('class', self.name + ' ' + InsightConstants.AxisClass)
            .attr('transform', self.transform())
            .call(this.axis)
            .selectAll('text')
            .attr('class', self.name + ' ' + InsightConstants.AxisTextClass)
            .style('text-anchor', self.textAnchor())
            .style('transform', self.tickRotation());

        var labels = d3.select(this.chart.element)
            .append('div')
            .attr('class', self.name + InsightConstants.AxisLabelClass)
            .style('position', 'absolute')
            .text(self.scale.title);

        this.positionLabels(labels);

    };



    this.draw = function(dragging)
    {
        this.axis = d3.svg.axis()
            .scale(this.scale.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.format());

        var axis = this.chart.chart.selectAll('g.' + self.name + '.' + InsightConstants.AxisClass)
            .call(this.axis);

        axis
            .selectAll("text")
            .attr('transform', self.tickRotation())
            .style('text-anchor', self.textAnchor());

        d3.select(this.chart.element)
            .select('div.' + self.name + InsightConstants.AxisLabelClass)
            .text(self.scale.title);
    };
}
;function LineSeries(name, chart, data, x, y, color)
{

    Series.call(this, name, chart, data, x, y, color);

    var self = this;

    var lineType = 'linear';

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

    var lineOver = function(d, item) {

    };

    var lineOut = function(d, item) {

    };

    var lineClick = function(d, item) {

    };

    this.rangeY = function(d)
    {
        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i)
    {
        var val = 0;

        if (self.x.scale.rangeBand)
        {
            val = self.x.scale(self.xFunction()(d)) + (self.x.scale.rangeBand() / 2);
        }
        else
        {

            val = self.x.scale(self.xFunction()(d));
        }

        return val;
    };

    this.lineType = function(_)
    {
        if (!arguments.length)
        {
            return lineType;
        }
        lineType = _;
        return this;
    };

    this.draw = function(dragging)
    {
        var transform = d3.svg.line()
            .x(self.rangeX)
            .y(self.rangeY)
            .interpolate(lineType);

        var rangeIdentifier = "path." + this.name + ".in-line";

        var rangeElement = this.chart.chart.selectAll(rangeIdentifier);

        if (!this.rangeExists(rangeElement))
        {
            this.chart.chart.append("path")
                .attr("class", this.name + " in-line")
                .attr("stroke", this.color)
                .attr("fill", "none")
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .on('mouseover', lineOver)
                .on('mouseout', lineOut)
                .on('click', lineClick);
        }

        var duration = dragging ? 0 : 300;

        this.chart.chart.selectAll(rangeIdentifier)
            .datum(this.dataset(), this.matcher)
            .transition()
            .duration(duration)
            .attr("d", transform);

        var circles = this.chart.chart.selectAll("circle")
            .data(this.dataset());

        circles.enter()
            .append('circle')
            .attr('class', 'target-point')
            .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
            .attr("cx", self.rangeX)
            .attr("cy", self.chart.height() - self.chart.margin()
                .bottom - self.chart.margin()
                .top)
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut);


        circles
            .transition()
            .duration(duration)
            .attr("cx", self.rangeX)
            .attr("cy", self.rangeY)
            .attr("r", 2.5);

        circles.append('svg:text')
            .attr('class', InsightConstants.ToolTipTextClass);

        circles.append('svg:text')
            .attr('class', InsightConstants.ToolTipLabelClass);

        circles.selectAll("." + InsightConstants.ToolTipTextClass)
            .text(this.tooltipValue);

        circles.selectAll("." + InsightConstants.ToolTipLabelClass)
            .text(this.tooltipLabel);
    };

    this.rangeExists = function(rangeSelector)
    {

        return rangeSelector[0].length;
    };
}

LineSeries.prototype = Object.create(Series.prototype);
LineSeries.prototype.constructor = LineSeries;
;function ColumnSeries(name, chart, data, x, y, color)
{

    Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var stacked = d3.functor(false);

    var barWidthFunction = this.x.rangeType;

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

        for (var series in this.series)
        {
            var s = this.series[series];
            var data = this.data.getData();
            var m = d3.max(data, s.accessor);
            max = m > max ? m : max;
        }

        return max;
    };


    this.series = [
    {
        name: 'default',
        accessor: function(d)
        {
            return d.value;
        },
        tooltipValue: function(d)
        {
            return d.value;
        },
        color: d3.functor('silver'),
        label: 'Value'
    }];

    this.stacked = function(_)
    {
        if (!arguments.length)
        {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.calculateYPos = function(func, d)
    {
        if (!d.yPos)
        {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };

    this.xPosition = function(d)
    {
        return self.x.scale(self.xFunction()(d));
    };

    this.calculateXPos = function(width, d)
    {
        if (!d.xPos)
        {
            d.xPos = self.xPosition(d);
        }
        else
        {
            d.xPos += width;
        }
        return d.xPos;
    };

    this.yPosition = function(d)
    {

        var position = self.stackedBars() ? self.y.scale(self.calculateYPos(self.yFunction(), d)) : self.y.scale(self.yFunction()(d));

        return position;
    };

    this.barWidth = function(d)
    {
        return self.x.scale.rangeBand(d);
    };

    this.groupedBarWidth = function(d)
    {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series.length == 1) ? groupWidth : groupWidth / self.series.length;

        return width;
    };

    this.offsetXPosition = function(d)
    {

        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.barHeight = function(d)
    {
        return (self.chart.height() - self.chart.margin()
            .top - self.chart.margin()
            .bottom) - self.y.scale(self.yFunction()(d));
    };

    this.stackedBars = function()
    {
        return self.stacked();
    };

    this.draw = function(drag)
    {

        var reset = function(d)
        {
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

        var click = function(filter)
        {
            return self.chart.filterClick(this, filter);
        };

        for (var ser in this.series)
        {
            var s = this.series[ser];

            this.yFunction(s.accessor);

            newBars = newGroups.append('rect')
                .attr('class', s.name + 'class bar')
                .attr('y', this.y.bounds[0])
                .attr('height', 0)
                .attr('fill', s.color)
                .attr("clip-path", "url(#" + this.chart.clipPath() + ")")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut)
                .on('click', click);

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

            bars.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(s.tooltipValue);

            bars.selectAll("." + InsightConstants.ToolTipLabelClass)
                .text(s.label);
        }
    };
}

ColumnSeries.prototype = Object.create(Series.prototype);
ColumnSeries.prototype.constructor = ColumnSeries;
;var ChartGroup = function ChartGroup(name)
{
    this.Name = name;
    this.Charts = [];
    this.Dimensions = [];
    this.FilteredDimensions = [];
    this.Groups = [];
    this.CumulativeGroups = [];
    this.ComputedGroups = [];
    this.LinkedCharts = [];
    this.NestedGroups = [];
};

ChartGroup.prototype.initCharts = function()
{
    this.Charts
        .forEach(
            function(chart)
            {
                chart.init();
            });
};

ChartGroup.prototype.addChart = function(chart)
{

    chart.filterEvent = this.chartFilterHandler.bind(this);
    chart.triggerRedraw = this.redrawCharts.bind(this);

    this.Charts.push(chart);

    return chart;
};

ChartGroup.prototype.addDimension = function(ndx, name, func, displayFunc)
{
    var dimension = new Dimension(name, func, ndx.dimension(func), displayFunc);

    this.Dimensions.push(dimension);

    return dimension;
};

ChartGroup.prototype.compareFilters = function(filterFunction)
{
    return function(d)
    {
        return String(d.name) == String(filterFunction.name);
    };
};

ChartGroup.prototype.chartFilterHandler = function(dimension, filterFunction)
{

    var self = this;

    if (filterFunction)
    {
        var dims = this.Dimensions
            .filter(dimension.comparer);

        var activeDim = this.FilteredDimensions
            .filter(dimension.comparer);

        if (!activeDim.length)
        {
            this.FilteredDimensions.push(dimension);
        }

        // d3.select(filterFunction.element)
        //     .classed('selected', true);

        var comparerFunction = this.compareFilters(filterFunction);

        dims.map(function(dim)
        {

            var filterExists = dim.Filters
                .filter(comparerFunction)
                .length;

            //if the dimension is already filtered by this value, toggle (remove) the filter
            if (filterExists)
            {

                self.removeMatchesFromArray(dim.Filters, comparerFunction);
                // d3.select(filterFunction.element)
                //     .classed('selected', false);

            }
            else
            {
                // add the provided filter to the list for this dimension

                dim.Filters.push(filterFunction);
            }

            // reset this dimension if no filters exist, else apply the filter to the dataset.
            if (dim.Filters.length === 0)
            {

                self.removeItemFromArray(self.FilteredDimensions, dim);
                dim.Dimension.filterAll();

            }
            else
            {
                dim.Dimension.filter(function(d)
                {
                    var vals = dim.Filters
                        .map(function(func)
                        {
                            return func.filterFunction(d);
                        });

                    return vals.filter(function(result)
                        {
                            return result;
                        })
                        .length;
                });
            }
        });

        // recalculate non standard groups
        this.NestedGroups
            .forEach(
                function(group)
                {
                    group.updateNestedData();
                }
        );

        this.ComputedGroups
            .forEach(
                function(group)
                {
                    group.compute();
                }
        );
        this.CumulativeGroups
            .forEach(
                function(group)
                {
                    group.calculateTotals();
                }
        );

        this.redrawCharts();
    }
};



ChartGroup.prototype.redrawCharts = function()
{
    for (var i = 0; i < this.Charts
        .length; i++)
    {
        this.Charts[i].draw();
    }
};


ChartGroup.prototype.aggregate = function(dimension, input)
{

    var group;

    if (input instanceof Array)
    {

        group = this.multiReduceSum(dimension, input);

        this.Groups.push(group);

    }
    else
    {

        var data = dimension.Dimension.group()
            .reduceSum(input);

        group = new Group(data);

        this.Groups.push(group);
    }

    return group;
};

ChartGroup.prototype.count = function(dimension, input)
{

    var group;

    if (input instanceof Array)
    {

        group = this.multiReduceCount(dimension, input);

        this.Groups.push(group);

    }
    else
    {
        var data = dimension.Dimension.group()
            .reduceCount(input);

        group = new Group(data);

        this.Groups.push(group);
    }

    return group;
};


ChartGroup.prototype.addSumGrouping = function(dimension, func)
{
    var data = dimension.Dimension.group()
        .reduceSum(func);
    var group = new Group(data);

    this.Groups.push(group);
    return group;
};

ChartGroup.prototype.addCustomGrouping = function(group)
{
    this.Groups.push(group);
    if (group.cumulative())
    {
        this.CumulativeGroups.push(group);
    }
    return group;
};

ChartGroup.prototype.multiReduceSum = function(dimension, properties)
{

    var data = dimension.Dimension.group()
        .reduce(
            function(p, v)
            {

                for (var property in properties)
                {
                    if (v.hasOwnProperty(properties[property]))
                    {
                        p[properties[property]] += v[properties[property]];
                    }
                }
                return p;
            },
            function(p, v)
            {
                for (var property in properties)
                {
                    if (v.hasOwnProperty(properties[property]))
                    {
                        p[properties[property]] -= v[properties[property]];
                    }
                }
                return p;
            },
            function()
            {
                var p = {};
                for (var property in properties)
                {
                    p[properties[property]] = 0;
                }
                return p;
            }
        );
    var group = new Group(data);

    return group;
};

ChartGroup.prototype.multiReduceCount = function(dimension, properties)
{

    var data = dimension.Dimension.group()
        .reduce(
            function(p, v)
            {
                for (var property in properties)
                {
                    if (v.hasOwnProperty(properties[property]))
                    {
                        p[properties[property]][v[properties[property]]] = p[properties[property]].hasOwnProperty(v[properties[property]]) ? p[properties[property]][v[properties[property]]] + 1 : 1;
                        p[properties[property]].Total++;
                    }
                }
                return p;
            },
            function(p, v)
            {
                for (var property in properties)
                {
                    if (v.hasOwnProperty(properties[property]))
                    {
                        p[properties[property]][v[properties[property]]] = p[properties[property]].hasOwnProperty(v[properties[property]]) ? p[properties[property]][v[properties[property]]] - 1 : 1;
                        p[properties[property]].Total--;
                    }
                }
                return p;
            },
            function()
            {
                var p = {};
                for (var property in properties)
                {
                    p[properties[property]] = {
                        Total: 0
                    };
                }
                return p;
            }
        );

    var group = new Group(data);
    this.Groups.push(group);

    return group;
};

ChartGroup.prototype.removeMatchesFromArray = function(array, comparer)
{
    var self = this;
    var matches = array.filter(comparer);
    matches.forEach(function(match)
    {
        self.removeItemFromArray(array, match);
    });
};
ChartGroup.prototype.removeItemFromArray = function(array, item)
{

    var index = array.indexOf(item);
    if (index > -1)
    {
        array.splice(index, 1);
    }
};
;var BaseChart = function BaseChart(name, element, dimension, data)
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
;function ColumnChart(name, element, dimension, group)
{

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    var mouseOver = function(d, item)
    {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item)
    {
        self.mouseOut(self, this, d);
    };

    this.calculateYPos = function(func, d)
    {
        if (!d.yPos)
        {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };

    this.calculateXPos = function(width, d)
    {
        if (!d.xPos)
        {
            d.xPos = self.xPosition(d);
        }
        else
        {
            d.xPos += width;
        }
        return d.xPos;
    };

    this.yPosition = function(d)
    {

        var position = self.stackedBars() ? self.y(self.calculateYPos(self._valueAccessor, d)) : self.y(self._valueAccessor(d));

        return position;
    };

    this.groupedBarWidth = function(d)
    {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series()
                .length == 1) ? groupWidth : groupWidth / self.series()
            .length;

        return width;
    };

    this.offsetXPosition = function(d)
    {

        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.stackedBars = function()
    {
        return self.stacked() || (this.series()
            .length == 1);
    };

    this.init = function()
    {

        var self = this;

        this.createChart();
        this.initializeAxes();

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient(self.yOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.yAxisFormat());

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient(self.xOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.xAxisFormat());

        this.addClipPath();

        if (this.zoomable())
        {
            this.initZoom();
        }

        this.drawAxes();

        this.draw();
    };

    this.draw = function(dragging)
    {
        var self = this;

        if (dragging && self.redrawAxes())
        {
            this.y.domain([0, d3.round(self.findMax(), 1)])
                .range([this.height() - this.margin()
                    .top - this.margin()
                    .bottom, 0
                ]);
        }

        this.drawRanges(InsightConstants.Behind);

        this.drawBars(dragging);

        this.drawRanges(InsightConstants.Front);

        this.drawTargets(dragging);

        this.updateAxes();
    };

    this.drawAxes = function()
    {

        this.chart.append('g')
            .attr('class', InsightConstants.YAxisClass)
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', InsightConstants.AxisTextClass);


        this.chart.append('g')
            .attr('class', InsightConstants.XAxisClass)
            .attr('transform', 'translate(0,' + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ')')
            .call(this.xAxis)
            .selectAll('text')
            .attr('class', InsightConstants.AxisTextClass)
            .style('text-anchor', 'start')
            .style('writing-mode', 'tb')
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter)
            {
                return self.filterClick(this, filter);
            });
    };




    this.drawRanges = function(filter)
    {

        var ranges = filter ? this.ranges()
            .filter(function(range)
            {
                return range.position == filter;
            }) : this.ranges();

        if (ranges)
        {
            for (var range in ranges)
            {

                this._rangeAccessor = ranges[range].calculation;

                var transform = ranges[range].type(this);

                var rangeIdentifier = "path." + ranges[range].class;

                var rangeElement = this.chart.selectAll(rangeIdentifier);

                if (!this.rangeExists(rangeElement))
                {
                    this.chart.append("path")
                        .attr("class", ranges[range].class)
                        .attr("fill", ranges[range].color);
                }

                this.chart.selectAll(rangeIdentifier)
                    .datum(this.dataset(), this.matcher)
                    .transition()
                    .duration(this.animationDuration)
                    .attr("d", transform);
            }
        }
    };

    this.rangeExists = function(rangeSelector)
    {

        return rangeSelector[0].length;
    };

    this.drawBars = function(drag)
    {

        var reset = function(d)
        {
            d.yPos = 0;
            d.xPos = 0;
        };

        var groups = this.chart
            .selectAll('g.' + InsightConstants.BarGroupClass)
            .data(this.dataset(), this.matcher)
            .each(reset);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', InsightConstants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        for (var seriesFunction in this.series())
        {

            this._valueAccessor = this.cumulative() ? this.series()[seriesFunction].cumulative : this.series()[seriesFunction].calculation;

            newBars = newGroups.append('rect')
                .attr('class', this.series()[seriesFunction].name + 'class bar')
                .attr('y', this.yDomain())
                .attr('height', 0)
                .attr('fill', this.series()[seriesFunction].color)
                .attr("clip-path", "url(#clip)")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipTextClass);

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipLabelClass);

            var duration = drag ? 0 : this.animationDuration;

            var bars = groups.selectAll('.' + this.series()[seriesFunction].name + 'class.bar')
                .transition()
                .duration(duration)
                .attr('y', this.yPosition)
                .attr('x', this.offsetXPosition)
                .attr('width', this.groupedBarWidth)
                .attr('height', this.barHeight);

            bars.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(this.tooltipText);

            bars.selectAll("." + InsightConstants.ToolTipLabelClass)
                .text(this.series()[seriesFunction].label);
        }
    };


    this.updateAxes = function()
    {

        var xaxis = this.chart.selectAll('g.' + InsightConstants.XAxisClass)
            .call(this.xAxis);

        xaxis
            .selectAll("text")
            .style('text-anchor', 'start')
            .style('writing-mode', 'tb')
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter)
            {
                return self.filterClick(this, filter);
            });

        xaxis
            .selectAll("text:not(.selected)")
            .attr('class', InsightConstants.XAxisClass + ' ' + InsightConstants.AxisTextClass);

        this.chart.selectAll('.' + InsightConstants.YAxisClass)
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', InsightConstants.AxisTextClass);

    };

    this.drawTargets = function()
    {

        if (this.targets())
        {

            this._targetAccessor = _targets.calculation;

            var targets = this.chart.selectAll("rect.target")
                .data(this.targetData(), this.matcher);

            var newTargets = targets
                .enter()
                .append("rect")
                .attr("class", "target " + _targets.name + "class")
                .on("mouseover", function(d)
                {
                    self.mouseOver(self, this);
                })
                .on("mouseout", function(d)
                {
                    self.mouseOut(self, this);
                });

            newTargets.append("svg:text")
                .text(this.targetTooltipText)
                .attr("class", InsightConstants.ToolTipTextClass);

            newTargets.append("svg:text")
                .text(_targets.label)
                .attr("class", InsightConstants.ToolTipLabelClass);

            targets
                .transition()
                .duration(this.animationDuration)
                .attr("x", this.targetX)
                .attr("y", this.targetY)
                .attr("width", this.targetWidth)
                .attr("height", 4)
                .attr("fill", _targets.color);


            targets.selectAll("." + InsightConstants.ToolTipTextClass)
                .text(this.targetTooltipText)
                .attr("class", InsightConstants.ToolTipTextClass);
        }
    };
}


ColumnChart.prototype = Object.create(BaseChart.prototype);
ColumnChart.prototype.constructor = ColumnChart;
;var MultipleChart = function MultipleChart(name, element, dimension, group, chartGroup)
{

    BaseChart.call(this, name, element, dimension, group);

    this._chartGroup = chartGroup;

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(self.tickSize())
        .tickPadding(10);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickSize(self.tickSize())
        .tickPadding(10)
        .tickFormat(function(d)
        {
            return self.xFormatFunc(d);
        });

    this.initializeAxes = function(set)
    {
        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds()
                .end
            ]);

        this.y.domain(this.keys())
            .rangeRoundBands([0, this.yDomain()], 0.2);
    };

    this.rowWidth = function(d)
    {
        return this.x(this._valueAccessor(d));
    }.bind(this);

    this.yPosition = function(d)
    {
        return this.y(d.key);
    }.bind(this);

    this.rowHeight = function()
    {
        return this.y.rangeBand();
    }.bind(this);

    this.barXPosition = function(d)
    {
        var x = 0;
        if (this.invert())
        {
            x = this.xBounds()
                .end - this.x(this._valueAccessor(d));
        }
        return x;
    }.bind(this);


    this.subChartName = function(key)
    {
        return 'sub' + self._name.replace(/ /g, "_") + key.replace(/\s/g, '');
    };


    this.createChart = function()
    {
        this.chart = d3.select(this.element)
            .append("div")
            .attr("class", "chart multiChart");

        this.chart.append("div")
            .attr('class', 'title')
            .text(this._displayName);


        return this.chart;
    };

    this.subCharts = [];

    this.init = function()
    {
        this.createChart();

        var charts = this.chart.selectAll('div.subchart')
            .data(this.dataset());

        charts.enter()
            .append('div')
            .attr('class', 'subchart')
            .attr('id', function(d)
            {
                return self.subChartName(self._keyAccessor(d));
            });

        this.dataset()
            .forEach(function(subChart)
            {

                var data = [];

                var k = self.dimension.Dimension.group()
                    .reduceCount()
                    .all()
                    .map(self._keyAccessor);

                k.forEach(function(d)
                {
                    var o = {
                        key: d
                    };

                    var value = $.grep(subChart.values, function(e)
                    {
                        return e.key == d;
                    });


                    var val = value.length ? self._valueAccessor(value[0]) : 0;

                    o.values = val;

                    data.push(o);
                });



                var group = new SimpleGroup(data);

                var name = '#' + self.subChartName(subChart.key);


                var newChart = new RowChart(subChart.key, name, self.dimension, group, self._chartGroup)
                    .width(300)
                    .height(300)
                    .tooltipLabel(self._tooltipLabel)
                    .tooltipFormat(self._tooltipFormat)
                    .ordered(self._orderChildren)
                    .valueAccessor(function(d)
                    {
                        return d.values;
                    })
                    .margin(
                    {
                        left: 120,
                        top: 0,
                        bottom: 0,
                        right: 0
                    });
                self.subCharts.push(newChart);
                self._chartGroup.addChart(newChart);
                newChart.init();
            });
    };

    this.draw = function()
    {

        var charts = this.chart.selectAll('div.subchart')
            .data(this.dataset());

        var data = this.dataset();

        this.subCharts.forEach(function(sc)
        {

            var subChartData = $.grep(data, function(d)
            {
                return d.key == sc.displayName();
            });

            subChartData = subChartData.length ? sc._valueAccessor(subChartData[0]) : [];

            sc.group.getData()
                .forEach(function(currentDataValue)
                {
                    var newDataValue = $.grep(subChartData, function(d)
                    {
                        return d.key == currentDataValue.key;
                    })[0];

                    currentDataValue.values = newDataValue ? newDataValue.values : 0;
                });

        });
    };
};


MultipleChart.prototype = Object.create(BaseChart.prototype);
MultipleChart.prototype.constructor = MultipleChart;
;var RowChart = function RowChart(name, element, dimension, group)
{

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();




    this.initializeAxes = function()
    {
        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient(self.yOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.yAxisFormat());

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient(self.xOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.xAxisFormat());

        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds()
                .end
            ]);

        this.y.domain(this.keys())
            .rangeRoundBands([this.yBounds()
                .start, this.yBounds()
                .end
            ], self.barPadding());
    };

    this.rowWidth = function(d)
    {
        return this.x(this._valueAccessor(d));
    }.bind(this);

    this.yPosition = function(d)
    {
        return this.y(d.key);
    }.bind(this);

    this.rowHeight = function()
    {
        return this.y.rangeBand();
    }.bind(this);

    this.barXPosition = function(d)
    {
        var x = 0;
        if (this.invert())
        {
            x = this.xBounds()
                .end - this.x(this._valueAccessor(d));
        }
        return x;
    }.bind(this);


    this.init = function()
    {
        var self = this;

        this.createChart();
        this.initializeAxes();


        this.chart.append("g")
            .attr("class", InsightConstants.YAxisClass)
            .call(this.yAxis)
            .selectAll("text")
            .attr('class', InsightConstants.AxisTextClass)
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter)
            {
                self.filterClick(this, filter);
            });

        this.draw();
    };


    this.draw = function()
    {

        var self = this;

        this.y
            .domain(this.keys())
            .rangeRoundBands([0, this.height()], self.barPadding());

        var transY = this.invert() ? (this.width() - this.margin()
            .right) : 0;
        this.chart
            .selectAll("g." + InsightConstants.YAxisClass)
            .attr('transform', 'translate(' + transY + ',0)')
            .call(this.yAxis)
            .selectAll("text")
            .each(function()
            {
                d3.select(this)
                    .classed(InsightConstants.AxisTextClass, 'true');
            })
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter)
            {
                self.filterClick(this, filter);
            });

        if (self._redrawAxes)
        {

            this.x.domain([0, this.findMax()])
                .range([0, this.xBounds()
                    .end
                ]);
        }

        var bars = this.chart.selectAll("rect")
            .data(this.dataset(), this.matcher);

        bars.exit()
            .remove();

        var newBars = bars.enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", this.yPosition)
            .attr("width", 0)
            .attr("fill", this.barColor())
            .attr("height", this.rowHeight)
            .on("mouseover", function(d, item)
            {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item)
            {
                self.mouseOut(self, this, d);
            });

        newBars.append("svg:text")
            .attr("class", "tipValue");

        newBars.append("svg:text")
            .attr("class", "tipLabel");

        var trans = bars.transition()
            .duration(this.animationDuration);

        trans.attr("x", this.barXPosition)
            .attr("width", this.rowWidth);

        bars.selectAll('text.tipValue')
            .text(this.tooltipText);

        bars.selectAll('text.tipLabel')
            .text(this.tooltipLabel());

        if (self._redrawAxes || self.orderable())
        {
            trans
                .attr("y", this.yPosition)
                .attr("height", this.rowHeight);
        }



    };

    return this;
};


RowChart.prototype = Object.create(BaseChart.prototype);
RowChart.prototype.constructor = RowChart;
;function PartitionChart(name, element, dimension, group)
{

    this.element = element;
    this.group = group;

    var w = 1120,
        h = 600,
        x = d3.scale.linear()
        .range([0, w]),
        y = d3.scale.linear()
        .range([0, h]);

    this.vis = d3.select(this.element)
        .append("div")
        .attr("class", "chart")
        .style("width", w + "px")
        .style("height", h + "px")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    this.partition = d3.layout.partition()
        .children(function(d)
        {
            return d.values;
        })
        .value(function(d)
        {
            return d.ProjectedRevenue;
        });

    this.init = function()
    {

        var self = this;

        var g = this.vis.selectAll("g")
            .data(self.partition.nodes(this.group()))
            .enter()
            .append("svg:g")
            .attr("transform", function(d)
            {
                return "translate(" + x(d.y) + "," + y(d.x) + ")";
            })
            .on("click", click);

        var kx = w / this.group()
            .dx,
            ky = h / 1;

        g.append("svg:rect")
            .attr("width", this.group()
                .dy * kx)
            .attr("height", function(d)
            {
                return d.dx * ky;
            })
            .attr("class", function(d)
            {
                return d.children ? "parent" : "child";
            })
            .attr('fill', 'rgb(135, 158, 192)')
            .style('stroke', '#fff');


        g.append("svg:text")
            .attr("transform", transform)
            .attr("dy", ".35em")
            .attr("dx", "2em")
            .attr("fill", "#ecf0f1")
            .style("font-size", "13px")
            .style("opacity", function(d)
            {
                return d.dx * ky > 12 ? 1 : 0;
            })
            .text(function(d)
            {
                return d.key;
            });


        function transform(d)
        {
            return "translate(8," + d.dx * ky / 2 + ")";
        }

        function click(d)
        {
            if (!d.children) return;

            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([d.y, 1])
                .range([d.y ? 40 : 0, w]);
            y.domain([d.x, d.x + d.dx]);

            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function(d)
                {
                    return "translate(" + x(d.y) + "," + y(d.x) + ")";
                });

            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function(d)
                {
                    return d.dx * ky;
                });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function(d)
                {
                    return d.dx * ky > 12 ? 1 : 0;
                });

            d3.event.stopPropagation();
        }
    };


}

PartitionChart.prototype = Object.create(BaseChart.prototype);
PartitionChart.prototype.constructor = PartitionChart;
