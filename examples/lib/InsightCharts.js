function Group(data) {
    this._data = data;
    this._cumulative = false;
    this._valueAccessor = function(d) {
        return d;
    };
    this._orderFunction = function(a, b) {
        return b.value - a.value;
    };
    this._ordered = false;
}

Group.prototype.filterFunction = function(f) {
    if (!arguments.length) {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Group.prototype.cumulative = function(c) {
    if (!arguments.length) {
        return this._cumulative;
    }
    this._cumulative = c;
    return this;
};

Group.prototype.getData = function() {
    var data;
    if (this._data.all) {
        data = this._data.all();
    } else {
        //not a crossfilter set
        data = this._data;
    }

    if (this._filterFunction) {
        data = data.filter(this._filterFunction);
    }

    return data;
};

Group.prototype.getOrderedData = function() {
    var data;

    if (this._data.all) {
        data = data = this._data.top(Infinity)
            .sort(this.orderFunction());
    } else {
        data = this._data.sort(this.orderFunction());
    }

    if (this._filterFunction) {
        data = data.filter(this._filterFunction);
    }

    return data;
};


Group.prototype.computeFunction = function(c) {
    this._ordered = true;
    if (!arguments.length) {
        return this._compute;
    }
    this._compute = c;
    return this;
};


Group.prototype.orderFunction = function(o) {
    if (!arguments.length) {
        return this._orderFunction;
    }
    this._orderFunction = o;
    return this;
};

Group.prototype.compute = function() {
    this._compute();
};

Group.prototype.valueAccessor = function(v) {
    if (!arguments.length) {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};


Group.prototype.calculateTotals = function() {
    if (this._cumulative) {
        var totals = {};
        var total = 0;
        var self = this;
        var data = this._ordered ? this.getOrderedData() : this.getData();

        data
            .forEach(function(d, i) {

                var value = self._valueAccessor(d);

                if (typeof(value) != "object") {
                    total += value;
                    d.Cumulative = total;
                } else {
                    for (var property in value) {
                        var totalName = property + 'Cumulative';

                        if (totals[totalName]) {
                            totals[totalName] += value[property];
                            value[totalName] = totals[totalName];
                        } else {
                            totals[totalName] = value[property];
                            value[totalName] = totals[totalName];
                        }
                    }
                }
            });
    }
    return this;
};


function SimpleGroup(data) {
    this._data = data;
    this._orderFunction = function(a, b) {
        return b.values - a.values;
    };
}
SimpleGroup.prototype = Object.create(Group.prototype);
SimpleGroup.prototype.constructor = SimpleGroup;

SimpleGroup.prototype.getOrderedData = function() {
    return this._data.sort(this._orderFunction);
};

SimpleGroup.prototype.getData = function() {
    return this._data;
};

function NestedGroup(dimension, nestFunction) {
    this._dimension = dimension;
    this._data = dimension.Dimension.bottom(Infinity);
    this._nestFunction = nestFunction;
    this._nestedData = nestFunction.entries(this._data);
}


NestedGroup.prototype = Object.create(Group.prototype);
NestedGroup.prototype.constructor = NestedGroup;


NestedGroup.prototype.getData = function() {
    return this._nestedData;
};

NestedGroup.prototype.updateNestedData = function() {
    this._data = this._dimension.Dimension.bottom(Infinity);
    this._nestedData = this._nestFunction.entries(this._data);
};


NestedGroup.prototype.getOrderedData = function() {
    return this._nestedData;
};
;var Dimension = function Dimension(name, func, dimension, displayFunction) {
    this.Dimension = dimension;
    this.Name = name;
    this.Filters = [];
    this.Function = func;

    this.displayFunction = displayFunction ? displayFunction : function(d) {
        return d;
    };

    this.comparer = function(d) {
        return d.Name == this.Name;
    }.bind(this);
};
;var InsightFormatters = (function(d3) {
    var exports = {};


    exports.moduleProperty = 1;

    exports.currencyFormatter = function(value) {
        var format = d3.format(",f");
        return '£' + format(value);
    };

    exports.dateFormatter = function(value) {
        var format = d3.time.format("%b %Y");
        return format(value);
    };

    return exports;
}(d3));
;var InsightConstants = (function() {
    var exports = {};

    exports.Behind = 'behind';
    exports.Front = 'front';
    exports.AxisTextClass = 'axis-text';
    exports.YAxisClass = 'y-axis';
    exports.XAxisClass = 'x-axis';
    exports.XAxisRotation = "rotate(90)";
    exports.ToolTipTextClass = "tipValue";
    exports.ToolTipLabelClass = "tipLabel";
    exports.BarGroupClass = "bargroup";
    return exports;
}());
;var ChartGroup = function ChartGroup(name) {
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

ChartGroup.prototype.initCharts = function() {
    this.Charts
        .forEach(
            function(chart) {
                chart.init();
            });
};

ChartGroup.prototype.addChart = function(chart) {

    chart.filterEvent = this.chartFilterHandler.bind(this);
    chart.triggerRedraw = this.redrawCharts.bind(this);

    this.Charts.push(chart);

    return chart;
};

ChartGroup.prototype.addDimension = function(ndx, name, func, displayFunc) {
    var dimension = new Dimension(name, func, ndx.dimension(func), displayFunc);

    this.Dimensions.push(dimension);

    return dimension;
};

ChartGroup.prototype.compareFilters = function(filterFunction) {
    return function(d) {
        return String(d.name) == String(filterFunction.name);
    };
};

ChartGroup.prototype.chartFilterHandler = function(dimension, filterFunction) {

    var self = this;

    if (filterFunction) {
        var dims = this.Dimensions
            .filter(dimension.comparer);

        var activeDim = this.FilteredDimensions
            .filter(dimension.comparer);

        if (!activeDim.length) {
            this.FilteredDimensions.push(dimension);
        }

        // d3.select(filterFunction.element)
        //     .classed('selected', true);

        var comparerFunction = this.compareFilters(filterFunction);

        dims.map(function(dim) {

            var filterExists = dim.Filters
                .filter(comparerFunction)
                .length;

            //if the dimension is already filtered by this value, toggle (remove) the filter
            if (filterExists) {

                self.removeMatchesFromArray(dim.Filters, comparerFunction);
                // d3.select(filterFunction.element)
                //     .classed('selected', false);

            } else {
                // add the provided filter to the list for this dimension

                dim.Filters.push(filterFunction);
            }

            // reset this dimension if no filters exist, else apply the filter to the dataset.
            if (dim.Filters.length === 0) {

                self.removeItemFromArray(self.FilteredDimensions, dim);
                dim.Dimension.filterAll();

            } else {
                dim.Dimension.filter(function(d) {
                    var vals = dim.Filters
                        .map(function(func) {
                            return func.filterFunction(d);
                        });

                    return vals.filter(function(result) {
                            return result;
                        })
                        .length;
                });
            }
        });

        // recalculate non standard groups
        this.NestedGroups
            .forEach(
                function(group) {
                    group.updateNestedData();
                }
        );

        this.ComputedGroups
            .forEach(
                function(group) {
                    group.compute();
                }
        );
        this.CumulativeGroups
            .forEach(
                function(group) {
                    group.calculateTotals();
                }
        );

        this.redrawCharts();
    }
};



ChartGroup.prototype.redrawCharts = function() {
    for (var i = 0; i < this.Charts
        .length; i++) {
        this.Charts[i].draw();
    }
};


ChartGroup.prototype.aggregate = function(dimension, input) {

    var group;

    if (input instanceof Array) {

        group = this.multiReduceSum(dimension, input);

        this.Groups.push(group);

    } else {

        var data = dimension.Dimension.group()
            .reduceSum(input);

        group = new Group(data);

        this.Groups.push(group);
    }

    return group;
};


ChartGroup.prototype.addSumGrouping = function(dimension, func) {
    var data = dimension.Dimension.group()
        .reduceSum(func);
    var group = new Group(data);

    this.Groups.push(group);
    return group;
};

ChartGroup.prototype.addCustomGrouping = function(group) {
    this.Groups.push(group);
    if (group.cumulative()) {
        this.CumulativeGroups.push(group);
    }
    return group;
};

ChartGroup.prototype.multiReduceSum = function(dimension, properties) {

    var data = dimension.Dimension.group()
        .reduce(
            function(p, v) {

                for (var property in properties) {
                    if (v.hasOwnProperty(properties[property])) {
                        p[properties[property]] += v[properties[property]];
                    }
                }
                return p;
            },
            function(p, v) {
                for (var property in properties) {
                    if (v.hasOwnProperty(properties[property])) {
                        p[properties[property]] -= v[properties[property]];
                    }
                }
                return p;
            },
            function() {
                var p = {};
                for (var property in properties) {
                    p[properties[property]] = 0;
                }
                return p;
            }
        );
    var group = new Group(data);

    return group;
};

ChartGroup.prototype.multiReduceCount = function(dimension, property) {

    var data = dimension.Dimension.group()
        .reduce(
            function(p, v) {
                if (!p.hasOwnProperty(v[property])) {

                    p[v[property]] = 1;
                } else {
                    p[v[property]] += 1;
                }

                p.Total += 1;

                return p;
            },
            function(p, v) {

                if (v.hasOwnProperty(properties[property])) {
                    p[v[property]] -= 1;
                }
                p.Total--;
                return p;
            },
            function() {
                return {
                    Total: 0
                };
            }
        );

    var group = new Group(data);
    this.Groups.push(group);

    return group;
};

ChartGroup.prototype.removeMatchesFromArray = function(array, comparer) {
    var self = this;
    var matches = array.filter(comparer);
    matches.forEach(function(match) {
        self.removeItemFromArray(array, match);
    });
};
ChartGroup.prototype.removeItemFromArray = function(array, item) {

    var index = array.indexOf(item);
    if (index > -1) {
        array.splice(index, 1);
    }
};
;var BaseChart = function BaseChart(name, element, dimension, data) {
    var self = this;

    this.element = element;
    this.dimension = dimension;
    this.group = data;
    this._name = name;
    var displayName = d3.functor(name);

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();


    this._keyAccessor = function(d) {
        return d.key;
    };

    this._valueAccessor = function(d) {
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

    var tooltipLabel = d3.functor("Value");

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
        label: function() {
            return self.tooltipLabel();
        },
        calculation: self._valueAccessor,
        color: function(d) {
            //console.log(barColor);
            return barColor(d);
        }
    };

    var _series = [this._defaultSeries];
    var _targets = null;
    var _ranges = [];

    this._targetAccessor = function(d) {
        return d.value;
    };

    this.matcher = function(d) {
        return self._keyAccessor(d);
    };

    this._rangeAccessor = function(d) {
        return d.value;
    };

    this._limitFunction = function(d) {
        return true;
    };

    this._labelAccessor = function(d) {
        return d.key;
    };

    this._tooltipFormat = function(d) {
        return d;
    };

    yAxisFormat = function(d) {
        return d;
    };

    xAxisFormat = function(d) {
        return d;
    };

    this.xPosition = function(d) {
        var offset = Math.round((self._barWidthFunction == self.x.rangeBand || self._barWidthFunction == self.x.rangeRound) ? 0 : self.barWidth(d) / 2);

        return self.x(self._keyAccessor(d)) - offset;
    };

    this.yPosition = function(d) {
        return self.y(self._valueAccessor(d));
    };

    this.rangeY = function(d, i) {
        return self.y(self._rangeAccessor(d));
    };


    this.animationDuration = function(d, i) {
        return self.duration + (i);
    };

    this.rangeX = function(d, i) {
        var offset = i == (self.keys()
            .length - 1) ? self._barWidthFunction(d) : 0;

        return self.x(self._keyAccessor(d)) + offset;
    };

    this.barHeight = function(d) {
        return (self.height() - self.margin()
            .top - self.margin()
            .bottom) - self.y(self._valueAccessor(d));
    };

    this.targetY = function(d, i) {
        return self.y(self._targetAccessor(d));
    };

    this.targetX = function(d, i) {

        var offset = (self._barWidthFunction == self.x.rangeBand) ? 0 : self.barWidth(d) / 2;

        return (self.x(self._keyAccessor(d)) + self._barWidthFunction(d) / 3) - offset;
    };

    this.targetWidth = function(d) {
        return self._barWidthFunction(d) / 3;
    };

    this.targetTooltipText = function(d) {
        return self._tooltipFormat(self._targetAccessor(d));
    };

    this.tooltipText = function(d) {
        return self._tooltipFormat(self._valueAccessor(d));
    };

    this.yDomain = function() {
        return self.height() - self.margin()
            .top - self.margin()
            .bottom;
    };


    this.xDomain = function() {
        return self.width() - self.margin()
            .left - self.margin()
            .right;
    };

    this.xBounds = function(d) {

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

    this.yBounds = function(d) {

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

    this.createChart = function(ignoreTitle) {

        if (!ignoreTitle) {
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

    this.calculateBarColor = function(d) {

        return barColor(d);
    };

    this.zoomable = function(_) {
        if (!arguments.length) {
            return this._zoomable;
        }
        this._zoomable = _;
        return this;
    };

    this.displayName = function(_) {
        if (!arguments.length) {
            return displayName();
        }
        displayName = d3.functor(_);
        return this;
    };

    this.tickSize = function(_) {
        if (!arguments.length) {
            return tickSize();
        }
        tickSize = d3.functor(_);
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

    this.orderable = function(_) {
        if (!arguments.length) {
            return orderable();
        }
        orderable = d3.functor(_);
        return this;
    };


    this.ordered = function(_) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(_);
        return this;
    };

    this.orderChildren = function(_) {
        if (!arguments.length) {
            return this._orderChildren;
        }
        this._orderChildren = _;
        return this;
    };


    this.initZoom = function() {
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


    this.addClipPath = function() {

        this.chart.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width())
            .attr("height", this.yDomain());

    };

    this.dragging = function() {

        this.draw(true);
    };

    this.setXAxisRange = function(rangeAccessor) {
        this._xRangeType = rangeAccessor(this.x);
        return this;
    };

    this.initializeAxes = function() {
        //have to pass the chart as a variable as the sub functions are run in a different context
        this.initializeXAxis(this);
        this.initializeYAxis(this);
    };

    this.xDomainRange = function() {
        //default behaviour for x axis is to treat it as an orginal range using the dataset's keys
        return this.keys();
    };

    this.xRange = function(f) {
        if (!arguments.length) {
            return this.xDomainRange();
        }
        this.xDomainRange = f;
        return this;
    };

    this.initializeYAxis = function(chart) {
        this.applyYAxisRange.call(chart.y.domain([0, chart.findMax()]), chart, chart._yRangeType);
    };

    this.initializeXAxis = function(chart) {
        this.applyXAxisRange.call(chart.x.domain(chart.xDomainRange()), chart, chart._xRangeType);
    };

    this.applyXAxisRange = function(chart, f) {
        f.apply(this, [
            [0, chart.xDomain()], chart.barPadding()
        ]);
    };

    this.applyYAxisRange = function(chart, f) {
        f.apply(this, [
            [chart.yDomain(), 0], 0
        ]);
    };

    this.link = function(chart, follow) {

        if (this._linkedCharts.indexOf(chart) == -1) {
            this._linkedCharts.push(chart);

            if (follow) {
                this._linkedCharts.forEach(function(c) {
                    c.link(chart, false);
                });
            }
        }
        return this;
    };


    this.cumulative = function(_) {
        if (!arguments.length) {
            return cumulative();
        }
        cumulative = d3.functor(_);
        return this;
    };


    this.xAxisFormat = function(_) {
        if (!arguments.length) {
            return self._xAxisFormat;
        }
        self._xAxisFormat = _;
        return this;
    };



    this.updateMax = function(d) {
        var value = 0;

        var func;

        for (var seriesFunction in this.series()) {
            func = this.cumulative() ? this.series()[seriesFunction].cumulative : this.series()[seriesFunction].calculation;
            value += func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }


        if (this.ranges()
            .length) {
            for (var rangeFunction in this.ranges()) {
                func = this.ranges()[rangeFunction].calculation;
                value = func(d);
                this._currentMax = value > this._currentMax ? value : this._currentMax;
            }
        }
        return this._currentMax;
    };


    this.targetMax = function(d) {
        var value = 0;

        if (_targets) {
            func = this.cumulative() ? _targets.cumulative : _targets.calculation;
            value = func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }
        return this._currentMax;
    };

    this.findMax = function() {
        var self = this;

        var max = d3.max(this.dataset(), function(d) {
            return self.updateMax(d);
        });

        if (_targets) {
            var targetsmax = d3.max(_targets.data.getData(), function(d) {
                return self.targetMax(d);
            });
            max = max > targetsmax ? max : targetsmax;
        }

        this.maxUpdatedEvent(max);

        return max;
    };

    this.zeroValueEntry = function(d) {
        var hasValue = 0;
        var func;

        if (this.series()
            .length) {
            for (var seriesFunction in this.series()) {
                func = this.cumulative() ? this.series()[seriesFunction].cumulative : this.series()[seriesFunction].calculation;

                hasValue = hasValue | (Math.round(func(d), 1) > 0);
            }
        } else {
            hasValue = hasValue | (Math.round(this._valueAccessor(d), 1) > 0);

        }
        if (_targets) {
            func = this.cumulative() ? _targets.cumulative : _targets.calculation;
            hasValue = hasValue | (Math.round(func(d), 1) > 0);
        }
        return hasValue;
    };



    this.keys = function() {
        var self = this;

        var keys = [];

        if (this.redrawAxes()) {
            keys = this.dataset()
                .filter(function(d) {
                    return self.zeroValueEntry(d);
                })
                .map(this._keyAccessor);
        } else {
            keys = this.dataset()
                .map(this._keyAccessor);
        }
        return keys;
    };

    this.series = function(_) {

        if (!arguments.length) {
            return _series;
        }
        _series = _;
        return this;
    };

    this.stacked = function(_) {
        if (!arguments.length) {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.targets = function(targets) {
        if (!arguments.length) {
            return _targets;
        }
        _targets = targets;
        return this;
    };

    this.ranges = function(_) {
        if (!arguments.length) {
            return _ranges;
        }
        _ranges = _;
        return this;
    };

    this.toggleSortIcon = function() {

        var self = this;

        if (self.ordered()) {
            d3.select(self.element)
                .select('.fa-arrow-up')
                .style('display', 'inline-block');
        } else {
            d3.select(self.element)
                .select('.fa-arrow-up')
                .style('display', 'none');
        }

    };

    this.titleClicked = function() {
        this.ordered(!this.ordered());

        this.toggleSortIcon.call(this);

        this.draw();

    };

    this.applyOrderableHeader = function() {

        var self = this;

        if (this.orderable()) {

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

    this.topResults = function(_) {
        if (!arguments.length) {
            return this._topResults;
        }
        this._topResults = _;
        return this;
    };

    this.dataset = function() {
        var data = this.ordered() ? this.group.getOrderedData() : this.group.getData();

        return data.filter(this._limitFunction);
    };

    this.targetData = function() {
        return _targets.data.getData()
            .filter(this._limitFunction);
    };

    this.keyAccessor = function(_) {
        if (!arguments.length) {
            return this._keyAccessor;
        }
        this._keyAccessor = _;
        return this;
    };

    this.labelAccessor = function(_) {
        if (!arguments.length) {
            return this._labelAccessor;
        }
        this._labelAccessor = _;
        return this;
    };

    this.tooltipFormat = function(_) {
        if (!arguments.length) {
            return this._tooltipFormat;
        }
        this._tooltipFormat = _;
        return this;
    };

    this.barPadding = function(_) {
        if (!arguments.length) {
            return barPadding();
        }
        barPadding = d3.functor(_);
        return this;
    };


    this.yAxisFormat = function(_) {
        if (!arguments.length) {
            return yAxisFormat;
        }
        yAxisFormat = _;
        return this;
    };


    this.valueAccessor = function(_) {
        if (!arguments.length) {
            return this._valueAccessor;
        }
        this._valueAccessor = _;
        this._defaultSeries.calculation = _;
        return this;
    };

    this.redrawAxes = function(_) {
        if (!arguments.length) {
            return redrawAxes();
        }
        redrawAxes = d3.functor(_);
        return this;
    };

    this.margin = function(_) {
        if (!arguments.length) {
            return this._margin;
        }
        this._margin = _;
        return this;
    };


    this.setXAxis = function(_) {

        if (!arguments.length) {
            return this.x;
        }
        this.x = _;
        return this;
    };

    this.invert = function(_) {

        if (!arguments.length) {
            return invert();
        }
        invert = d3.functor(_);
        return this;

    };

    this.setHover = function() {
        d3.select(this)
            .classed("active", true);
    };



    this.removeHover = function() {
        d3.select(this)
            .classed("active", false);
    };

    this.mouseOver = function(chart, item, d) {
        if (chart.hasTooltip) {
            var tipValue = $(item)
                .find('.tipValue')
                .first()
                .text();
            var tipLabel = $(item)
                .find('.tipLabel')
                .first()
                .text();

            chart.tip.show({
                label: tipLabel,
                value: tipValue
            });
        }

        d3.select(item)
            .classed("active", true);
    };

    this.mouseOut = function(chart, item, d) {
        if (chart.hasTooltip) {
            chart.tip.hide(d);
        }

        d3.select(item)
            .classed("active", false);
    };


    this.isFunction = function(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    };

    this.labelColor = function(_) {
        if (!arguments.length) {
            return this._labelColor;
        }
        this._labelColor = _;
        return this;
    };

    this.barColor = function(_) {
        if (!arguments.length) {
            return barColor();
        }
        barColor = d3.functor(_);
        return this;
    };

    this.tooltipLabel = function(_) {
        if (!arguments.length) {
            return tooltipLabel();
        }
        tooltipLabel = d3.functor(_);
        return this;
    };

    this.tooltip = function() {
        var self = this;
        this.hasTooltip = true;

        this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<span class='tiplabel'>" + d.label + ": </span><span class='tipvalue'>" + d.value + "</span>";
            });

        this.chart.call(this.tip);

        return this;
    };


    this.filterKey = function() {};


    this.limit = function(_) {
        if (!arguments.length) {
            return this._limitFunction;
        }
        this._limitFunction = _;
        return this;
    };


    this.labelPadding = function(_) {
        if (!arguments.length) {
            return labelPadding();
        }
        labelPadding = d3.functor(_);
        return this;
    };

    this.labelFontSize = function(_) {
        if (!arguments.length) {
            return labelFontSize();
        }
        labelFontSize = d3.functor(_);
        return this;
    };


    this.labelAnchoring = function(d) {
        if (this.invert()) {
            return "end";
        } else {
            return "start";
        }
    };

    this.filterFunction = function(filter, element) {
        var value = filter.key ? filter.key : filter;

        return {
            name: value,
            element: element,
            filterFunction: function(d) {
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
    this.maxUpdatedEvent = function(max) {

        this._linkedCharts.forEach(function(chart) {

            chart._currentMax = chart._currentMax < max ? max : chart._currentMax;
        });
    };

    this.filterClick = function(element, filter) {
        if (this.dimension) {
            var filterFunction = this.filterFunction(filter, element);

            this.filterEvent(this.dimension, filterFunction);
        }
    };

    this.barWidth = function(d) {
        return self._barWidthFunction(d);
    };

};
;function Legend(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.dataset = function() {
        return this.group;
    };

    this.init = function() {
        var self = this;

        this.createChart();

        var legend = this.chart.selectAll(".legend")
            .data(this.dataset())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + ((i * 20) + (i * 5)) + ")";
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("rx", 10)
            .attr("ry", 10)
            .style("fill", function(d) {
                return d.color;
            });

        legend.append("text")
            .attr("x", 25)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text(function(d) {
                return d.label;
            });

    };

    this.draw = function() {

    };
}


Legend.prototype = Object.create(BaseChart.prototype);
Legend.prototype.constructor = Legend;
;function DataTable(name, element, dimension, group) {
    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this._columns = [];

    this.chart = d3.select(this.element)
        .append("table")
        .attr("class", "dataTable");

    this.columns = function(c) {
        if (!arguments.length) {
            return this._columns;
        }
        this._columns = c;
        return this;

    };

    this.init = function() {
        var self = this;

        this.header = this.chart.append("thead")
            .append("tr");

        this.header.append("th")
            .attr('class', 'blank')
            .html("");

        this.header.selectAll("th.column")
            .data(this._columns)
            .enter()
            .append("th")
            .attr('class', 'column')
            .html(function(d) {
                return d.label;
            });

        this.rows = this.chart.selectAll("tr.datarow")
            .data(this.dataset());

        this.rows.enter()
            .append("tr")
            .attr("class", "datarow");

        this.rows.append("th")
            .html(function(d) {
                return self._keyAccessor(d);
            });

        this.cells = this.rows.selectAll("td")
            .data(function(row) {
                return self._columns.map(function(column) {
                    return {
                        column: column,
                        value: column.formatter(column.calculation(row))
                    };
                });
            });

        var newEntries = this.cells.enter();
        newEntries.append("td")
            .html(function(d) {
                return d.value;
            });
    };

    this.draw = function() {
        var self = this;

        this.rows = this.chart.selectAll("tr.datarow")
            .data(this.dataset());

        this.rows.enter()
            .append("tr")
            .attr("class", "datarow");

        this.cells = this.rows.selectAll("td")
            .data(function(row) {
                return self._columns.map(function(column) {
                    return {
                        column: column,
                        value: column.formatter(column.calculation(row))
                    };
                });
            });

        this.cells.enter()
            .append("td");

        this.cells.html(function(d) {
            return d.value;
        });

        this.cells.exit()
            .remove();

        this.rows.exit()
            .remove();
    };
}

DataTable.prototype = Object.create(BaseChart.prototype);
DataTable.prototype.constructor = DataTable;
;function BarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);


    this.y2 = null;


    var self = this;

    this.xFormatFunc = function(d) {
        return d;
    };

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };

    this.xAxisFormat = function(f) {
        this.xFormatFunc = f;
        return this;
    };


    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
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

        var position = self.stackedBars() ? self.y(self.calculateYPos(self._valueAccessor, d)) : self.y(self._valueAccessor(d));

        return position;
    };

    this.groupedBarWidth = function(d) {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series()
                .length == 1) ? groupWidth : groupWidth / self.series()
            .length;

        return width;
    };

    this.offsetXPosition = function(d) {

        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.stackedBars = function() {
        return self.stacked() || (this.series()
            .length == 1);
    };

    this.init = function() {

        var self = this;

        this.createChart();
        this.initializeAxes();

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient('left')
            .tickSize(0)
            .tickFormat(yAxisFormat);

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient('bottom')
            .tickSize(0)
            .tickFormat(xAxisFormat);

        this.addClipPath();

        if (this.zoomable()) {
            this.initZoom();
        }

        this.drawAxes();

        this.draw();
    };

    this.draw = function(dragging) {

        var self = this;

        if (dragging && self.redrawAxes()) {
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

    this.drawAxes = function() {

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
            .attr("transform", InsightConstants.XAxisRotation)
            .attr("dx", "10")
            .attr("dy", "0")
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });
    };




    this.drawRanges = function(filter) {

        var ranges = filter ? this.ranges()
            .filter(function(range) {
                return range.position == filter;
            }) : this.ranges();

        if (ranges) {
            for (var range in ranges) {

                this._rangeAccessor = ranges[range].calculation;

                var transform = ranges[range].type(this);

                var rangeIdentifier = "path." + ranges[range].class;

                var rangeElement = this.chart.selectAll(rangeIdentifier);

                if (!this.rangeExists(rangeElement)) {
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

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };

    this.drawBars = function(drag) {

        var reset = function(d) {
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

        console.log(this);

        for (var seriesFunction in this.series()) {

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


    this.updateAxes = function() {

        var xaxis = this.chart.selectAll('g.x-axis')
            .call(this.xAxis);

        xaxis
            .selectAll("text")
            .style('text-anchor', 'start')
            .attr("transform", InsightConstants.XAxisRotation)
            .attr("dx", "10")
            .attr("dy", "0")
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });

        xaxis
            .selectAll("text:not(.selected)")
            .attr('class', 'x-axis axis-text');


        this.chart.selectAll('.y-axis')
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', 'axis-text');

    };

    this.drawTargets = function() {

        if (this.targets()) {

            this._targetAccessor = _targets.calculation;

            var targets = this.chart.selectAll("rect.target")
                .data(this.targetData(), this.matcher);

            var newTargets = targets
                .enter()
                .append("rect")
                .attr("class", "target " + _targets.name + "class")
                .on("mouseover", function(d) {
                    self.mouseOver(self, this);
                })
                .on("mouseout", function(d) {
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


BarChart.prototype = Object.create(BaseChart.prototype);
BarChart.prototype.constructor = BarChart;
;var MultipleChart = function MultipleChart(name, element, dimension, group, chartGroup) {

    BaseChart.call(this, name, element, dimension, group);

    this._chartGroup = chartGroup;

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self.xFormatFunc(d);
        });

    this.initializeAxes = function(set) {
        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds()
                .end
            ]);

        this.y.domain(this.keys())
            .rangeRoundBands([0, this.yDomain()], 0.2);
    };

    this.rowWidth = function(d) {
        return this.x(this._valueAccessor(d));
    }.bind(this);

    this.yPosition = function(d) {
        return this.y(d.key);
    }.bind(this);

    this.rowHeight = function() {
        return this.y.rangeBand();
    }.bind(this);

    this.barXPosition = function(d) {
        var x = 0;
        if (this.invert()) {
            x = this.xBounds()
                .end - this.x(this._valueAccessor(d));
        }
        return x;
    }.bind(this);


    this.subChartName = function(key) {
        return 'sub' + self._name.replace(/ /g, "_") + key.replace(/\s/g, '');
    };


    this.createChart = function() {
        this.chart = d3.select(this.element)
            .append("div")
            .attr("class", "chart multiChart");

        this.chart.append("div")
            .attr('class', 'title')
            .text(this._displayName);


        return this.chart;
    };

    this.subCharts = [];

    this.init = function() {
        this.createChart();

        var charts = this.chart.selectAll('div.subchart')
            .data(this.dataset());

        charts.enter()
            .append('div')
            .attr('class', 'subchart')
            .attr('id', function(d) {
                return self.subChartName(self._keyAccessor(d));
            });

        this.dataset()
            .forEach(function(subChart) {

                var data = [];

                var k = self.dimension.Dimension.group()
                    .reduceCount()
                    .all()
                    .map(self._keyAccessor);

                k.forEach(function(d) {
                    var o = {
                        key: d
                    };

                    var value = $.grep(subChart.values, function(e) {
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
                    .valueAccessor(function(d) {
                        return d.values;
                    })
                    .margin({
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

    this.draw = function() {

        var charts = this.chart.selectAll('div.subchart')
            .data(this.dataset());

        var data = this.dataset();

        this.subCharts.forEach(function(sc) {

            var subChartData = $.grep(data, function(d) {
                return d.key == sc.displayName();
            });

            subChartData = subChartData.length ? sc._valueAccessor(subChartData[0]) : [];

            sc.group.getData()
                .forEach(function(currentDataValue) {
                    var newDataValue = $.grep(subChartData, function(d) {
                        return d.key == currentDataValue.key;
                    })[0];

                    currentDataValue.values = newDataValue ? newDataValue.values : 0;
                });

        });
    };
};


MultipleChart.prototype = Object.create(BaseChart.prototype);
MultipleChart.prototype.constructor = MultipleChart;
;function GroupedBarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.groupNames = [];
    this.x = d3.scale.ordinal();
    this.subX = d3.scale.ordinal();

    this.y = d3.scale.linear();

    this.xFormatFunc = function(d) {
        return d;
    };

    this.color = d3.scale.ordinal()
        .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self.xFormatFunc(d);
        });

    this.xAxisFormat = function(f) {
        this.xFormatFunc = f;
        return this;
    };

    this.labelAnchoring = function(d) {
        if (this.invert()) {
            return "start";
        } else {
            return "end";
        }
    };

    this.groupNames = function(d) {
        if (!arguments) {
            return this._groupNames;
        }
        this._groupNames = d;
        return this;
    };

    this.yScaleMax = function() {

        var max = d3.max(this.dataset(), function(d) {
            var m = 0;

            m = m < d.value.Total ? d.value.Total : m;

            return m;
        });
        return max;
    };

    this.initializeAxes = function() {

        this.x.domain(this.keys())
            .rangeRoundBands([0, this.width() - this.margin()
                .left - this.margin()
                .right
            ], 0.2);
        this.subX.domain(this._groupNames)
            .rangeRoundBands([0, this.x.rangeBand()], 0.1);

        this.y.domain([0, this.yScaleMax()])
            .range([this.height() - this.margin()
                .top - this.margin()
                .bottom, 0
            ]);
    };

    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();

        var groups = this.chart.selectAll(".group")
            .data(this.dataset())
            .enter()
            .append("g")
            .attr("class", "group")
            .attr("transform", function(d) {
                return "translate(" + self.x(self._keyAccessor(d)) + ",0)";
            });

        var total = groups.append("rect")
            .attr("class", "total")
            .attr("width", this.x.rangeBand())
            .attr("x", 0)
            .attr("y", function(d) {
                return self.y(d.value.Total);
            })
            .attr("height", function(d) {
                return (self.height() - self.margin()
                    .top - self.margin()
                    .bottom) - self.y(d.value.Total);
            })
            .attr("fill", "silver")
            .on("mouseover", function(d, item) {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item) {
                self.mouseOut(self, this, d);
            });

        total.append("svg:text")
            .text(function(d) {
                return self.tooltipLabel();
            })
            .attr("class", "tipLabel");

        total.append("svg:text")
            .text(function(d) {
                return self._tooltipFormat(d.value.Total);
            })
            .attr("class", "tipValue");

        var bars = groups.selectAll("rect.subbar")
            .data(function(d) {
                var vals = [];
                for (var key in d.value.Groups) {
                    vals.push({
                        key: key,
                        value: d.value.Groups[key].Value
                    });
                }
                return vals;
            });

        bars
            .enter()
            .append("rect")
            .attr("class", "subbar")
            .attr("width", this.subX.rangeBand())
            .attr("x", function(d) {
                return self.subX(d.key);
            })
            .attr("y", function(d) {
                return self.y(d.value);
            })
            .attr("height", function(d) {
                return (self.height() - self.margin()
                    .top - self.margin()
                    .bottom) - self.y(d.value);
            })
            .attr("fill", function(d) {
                return self.color(d.key);
            })
            .on("mouseover", function(d, item) {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item) {
                self.mouseOut(self, this, d);
            });

        bars.append("svg:text")
            .text(function(d) {
                return self._tooltipFormat(self._valueAccessor(d));
            })
            .attr("class", "tipValue");

        bars.append("svg:text")
            .text(function(d) {
                return self.tooltipLabel();
            })
            .attr("class", "tipLabel");


        this.chart.append("g")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333");

        this.chart.append("g")
            .attr("transform", "translate(0," + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ")")
            .call(this.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333")
            .attr("transform", function(d) {
                return "rotate(-90," + 0 + "," + 15 + ")";
            })
            .on("click", function(filter) {
                return self.filterClick(this, filter);
            });


        var legend = this.chart.selectAll(".legend")
            .data(this._groupNames)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .attr("x", this.width() - this.margin()
                .right / 2)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", this.color);

        legend.append("text")
            .attr("x", this.width() - this.margin()
                .right / 2 - 10)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) {
                return d;
            });

    };

    this.draw = function() {

        var self = this;

        var groups = this.chart.selectAll("g.group")
            .data(this.dataset());

        groups.selectAll("rect.total")
            .transition()
            .duration(self.duration)
            .attr("y", function(d) {
                return self.y(d.value.Total);
            })
            .attr("height", function(d) {
                return (self.height() - self.margin()
                    .top - self.margin()
                    .bottom) - self.y(d.value.Total);
            });

        groups.selectAll("rect.subbar")
            .data(function(d) {
                var vals = [];
                for (var key in d.value.Groups) {
                    vals.push({
                        key: key,
                        value: d.value.Groups[key].Value
                    });
                }
                return vals;
            })
            .transition()
            .duration(self.duration)
            .attr("y", function(d) {
                return self.y(d.value);
            })
            .attr("height", function(d) {
                return (self.height() - self.margin()
                    .top - self.margin()
                    .bottom) - self.y(d.value);
            });

    };
}


GroupedBarChart.prototype = Object.create(BaseChart.prototype);
GroupedBarChart.prototype.constructor = GroupedBarChart;
;function StackedBarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.xFormatFunc = function(d) {
        return d;
    };

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };



    this.xAxisFormat = function(f) {
        this.xFormatFunc = f;
        return this;
    };


    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };


    this.yPosition = function(d) {
        return this.y(this.calculateYPos(this._valueAccessor, d));
    }.bind(this);



    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient('left')
            .tickSize(0)
            .tickFormat(function(d) {
                return self._yAxisFormat(d);
            });

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient('bottom')
            .tickSize(0)
            .tickFormat(function(d) {
                return self.xFormatFunc(d);
            });

        this.addClipPath();

        if (this.zoomable()) {
            this.initZoom();
        }

        var groups = this.chart
            .selectAll('g')
            .data(this.dataset());

        var newGroups = groups.enter()
            .append('g')
            .attr('class', 'bargroup');

        var bars = newGroups.selectAll('rect.bar');

        for (var seriesFunction in this._series) {
            this._valueAccessor = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            bars = newGroups.append('rect')
                .attr('class', self._series[seriesFunction].name + 'class bar')
                .attr('x', this.xPosition)
                .attr('y', this.yDomain())
                .attr('width', this.barWidth)
                .attr('height', 0)
                .attr('fill', this._series[seriesFunction].color)
                .attr("clip-path", "url(#clip)")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            bars.transition()
                .duration(this.animationDuration)
                .attr('y', this.yPosition)
                .attr('height', this.barHeight);

            bars.append('svg:text')
                .text(this.tooltipText)
                .attr('class', 'tipValue');

            bars.append('svg:text')
                .text(this._series[seriesFunction].label)
                .attr('class', 'tipLabel');
        }

        this.chart.append('g')
            .attr('class', 'y-axis')
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', 'axis-text');

        this.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ')')
            .call(this.xAxis)
            .selectAll('text')
            .attr('class', 'x-axis axis-text')
            .style('text-anchor', 'start')
            .attr("transform", "rotate(90)")
            .attr("dx", "10")
            .attr("dy", "0")
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });

        if (this._targets) {
            this.drawTargets();
        }
    };


    this.draw = function(drag) {

        var self = this;

        if (drag && self.redrawAxes()) {
            this.y.domain([0, d3.round(self.findMax(), 1)])
                .range([this.height() - this.margin()
                    .top - this.margin()
                    .bottom, 0
                ]);
        }

        var groups = this.chart.selectAll('g.bargroup')
            .data(this.dataset())
            .each(function(d, i) {
                d.yPos = 0;
            });

        for (var seriesFunction in this._series) {

            this._valueAccessor = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            var duration = drag ? 0 : this.animationDuration;

            var bars = groups.selectAll('.' + self._series[seriesFunction].name + 'class.bar')
                .transition()
                .duration(duration)
                .attr('x', this.xPosition)
                .attr('y', this.yPosition)
                .attr('width', this.barWidth)
                .attr('height', this.barHeight);

            bars.selectAll('text.tipValue')
                .text(this.tooltipText);

            bars.selectAll('text.tipLabel')
                .text(this._series[seriesFunction].label);

        }

        if (this._targets) {
            this.updateTargets(drag);
        }

        var xaxis = this.chart.selectAll('g.x-axis')
            .call(this.xAxis);

        xaxis
            .selectAll("text")
            .style('text-anchor', 'start')
            .attr("transform", "rotate(90)")
            .attr("dx", "10")
            .attr("dy", "0")
            .on('mouseover', this.setHover)
            .on('mouseout', this.removeHover)
            .on('click', function(filter) {
                return self.filterClick(this, filter);
            });

        xaxis
            .selectAll("text:not(.selected)")
            .attr('class', 'x-axis axis-text');


        this.chart.selectAll('.y-axis')
            .call(this.yAxis)
            .selectAll('text')
            .attr('class', 'axis-text');
    };

    this.drawTargets = function() {


        var groups = this.chart.selectAll('g')
            .data(this.targetData());

        if (this._targets) {

            this._targetAccessor = this.cumulative() ? self._targets.cumulative : self._targets.calculation;


            var tBars = groups.append('rect')
                .attr('class', this._targets.name + 'class target')
                .attr('x', this.targetX)
                .attr('y', this.targetY)
                .attr('width', this.targetWidth)
                .attr('height', 4)
                .attr('fill', this._targets.color)
                .attr("clip-path", "url(#clip)")
                .on('mouseover', mouseOver)
                .on('mouseout', mouseOut);

            tBars.append('svg:text')
                .text(this.targetTooltipText)
                .attr('class', 'tipValue');

            tBars.append('svg:text')
                .text(this._targets.label)
                .attr('class', 'tipLabel');
        }
    };

    this.updateTargets = function(drag) {

        var groups = this.chart.selectAll('g.bargroup')
            .data(this.targetData());

        if (this._targets) {

            this._valueAccessor = this.cumulative() ? self._targets.cumulative : self._targets.calculation;

            var tBars = groups.selectAll('rect.' + self._targets.name + 'class.target');

            var duration = drag ? 0 : this.animationDuration;

            tBars.transition()
                .duration(duration)
                .attr('x', this.targetX)
                .attr('width', this.targetWidth)
                .attr('y', this.targetY);

            tBars.selectAll('text.tipValue')
                .text(this.targetTooltipText)
                .attr('class', 'tipValue');
        }
    };

}


StackedBarChart.prototype = Object.create(BaseChart.prototype);
StackedBarChart.prototype.constructor = StackedBarChart;
;function TimeLine(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.maxRange = d3.max(this.dataset(), function(d) {
        return d.value;
    });

    this.range = [this.dimension.Dimension.bottom(1)[0].Date, this.dimension.Dimension.top(1)[0].Date];

    this.brushColor = function(d) {
        if (!arguments.length) {
            return this._brushColor;
        }
        this._brushColor = d;
        return this;
    };

    this.initializeAxes = function() {

        this.x = d3.time.scale()
            .domain(this.range)
            .rangeRound([0, this.width()]);

        this.y = d3.scale.linear()
            .domain([0, this.maxRange])
            .rangeRound([this.yDomain(), 0]);

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .tickSize(0)
            .orient('bottom');
    };

    this.display = function() {

        var self = this;

        var minExtent = self.brush.extent()[0],
            maxExtent = self.brush.extent()[1];

        var func = {
            name: 'timeline',
            filterFunction: function(d) {
                return d >= minExtent && d <= maxExtent;
            }
        };


        if (String(minExtent) != String(maxExtent)) {
            // remove old filter if one exists
            if (this.oldFilter) {
                this.filterEvent(this.dimension, this.oldFilter);
            }

            this.filterEvent(this.dimension, func);

            this.oldFilter = func;

            self.mini.select('.brush')
                .call(self.brush.extent([minExtent, maxExtent]));
        } else {
            this.filterEvent(this.dimension, this.oldFilter);
        }

    };


    this.init = function() {

        this.createChart();
        this.initializeAxes();

        this.mini = this.chart.append('g')
            .attr('width', this.width())
            .attr('height', this.yDomain())
            .attr('class', 'mini');

        this.brush = d3.svg.brush()
            .x(this.x)
            .on('brush', function() {
                self.display();
            });


        //mini item rects
        self.mini.append('g')
            .selectAll('.miniItems')
            .data(this.dataset())
            .enter()
            .append('rect')
            .attr('class', 'minitems')
            .attr('x', this.xPosition)
            .attr('y', this.yPosition)
            .attr('width', 5)
            .attr('height', this.barHeight)
            .attr('fill', self._barColor);

        self.mini.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.yDomain() + ')')
            .style('font-size', '11px')
            .call(self.xAxis);

        self.mini.append('g')
            .attr('class', 'x brush')
            .call(self.brush)
            .selectAll('rect')
            .attr('height', this.yDomain())
            .attr('fill', self._brushColor)
            .style('opacity', '0.5');
    };


    this.draw = function() {
        var self = this;

        //mini item rects
        self.chart.selectAll('rect.minitems')
            .data(this.dataset())
            .transition()
            .duration(self.duration)
            .attr('y', this.yPosition)
            .attr('height', this.barHeight);

    };
}


TimeLine.prototype = Object.create(BaseChart.prototype);
TimeLine.prototype.constructor = TimeLine;
;function TimelineChart(element, key, values) {

    BaseChart.call(this, name, element, null, null);

    var self = this;

    this.values = values;
    this.key = key;

    this.dataset = function() {

        return this.values;
    };


    this.longdrag = false;

    this.drag = d3.behavior.drag()
        .on("drag", function(d, i) {
            var diff = 0;

            d3.select(this)
                .attr("y", this.y.baseVal.value + d3.event.dy)
                .attr("height", this.height.baseVal.value - d3.event.dy)
                .classed("active", true);


        })
        .on("dragend", function(d, i) {

            self.updatedEntryHandler.call(this, self.key, d, Math.round(self.y.invert(this.y.baseVal.value)));
            d3.select(this)
                .classed("active", false);
        });


    this.updatedEntryHandler = function(key, d, i) {
        self.draw();
    };

    this.newEntryHandler = function(key, d, i) {

    };

    this.clickEvent = function() {
        if (!self.longdrag) {
            var m = d3.mouse(this);
            var xPos = self.x.invert(m[0]);
            xPos = new Date(xPos.getFullYear(), xPos.getMonth(), 1, 1, 0, 0);

            var yPos = Math.round(self.y.invert(m[1]));

            self.newEntryHandler(self.key, xPos, yPos);
        }

        clearTimeout(self.timeout);
        self.longdrag = false;
    };

    this.keys = function() {
        var keys = this.dataset()
            .map(function(d) {
                return new Date(d.Date);
            });

        return keys;
    };

    this.initializeAxes = function() {

        this.x = d3.time.scale();
        this.y = d3.scale.linear();
        var max = this.findMax();
        max = max ? max + 10 : 10;

        var keys = this.keys();

        this.x.domain([new Date(2013, 0, 1), new Date(2015, 0, 1)])
            .range([0, this.xDomain()]);

        this.y
            .domain([0, max])
            .rangeRound([this.yDomain(), 0]);

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient("bottom")
            .tickSize(0)
            .tickPadding(6);

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .tickSize(0)
            .orient("left")
            .tickPadding(10);

        this.zoom = d3.behavior.zoom()
            .on("zoom", this.dragging);

        this.zoom.x(this.x);
    };

    this.dragging = function() {

        self.timeout = setTimeout(function() {
            self.longdrag = true;
        }, 100);

        self.draw();
    };

    this.init = function() {

        this.createChart();

        this._currentMax = this.findMax();

        this.initializeAxes();


        $.each(this.dataset(), function(i, d) {
            d.Date = new Date(d.Date);
        });

        this.chart.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width())
            .attr("height", this.yDomain());

        this.chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ")");

        this.chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + 0 + ",0)");

        this.chart.append("rect")
            .attr("class", "pane")
            .attr("width", this.width())
            .attr("height", this.yDomain())
            .on("click", self.clickEvent)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(this.zoom);

        this.draw();

    };


    this.draw = function() {

        var item = self.dataset();

        var max = self.findMax();

        max = max ? max + 10 : 10;
        self.y
            .domain([0, max]);

        self.chart.select("g.x.axis")
            .call(self.xAxis)
            .selectAll("text")
            .style("font-size", "12px");

        self.chart.select("g.y.axis")
            .call(self.yAxis)
            .selectAll("text")
            .style("font-size", "12px");

        var items = self.chart.selectAll("rect.item")
            .data(self.dataset())
            .enter()
            .append("rect")
            .attr("class", "item")
            .attr("fill", "#ACC3EE");

        items.append("svg:text")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        items.append("svg:text")
            .text(this._tooltipLabel)
            .attr("class", "tipLabel");

        self.chart.selectAll("rect.item")
            .data(self.dataset())
            .attr("class", "item")
            .attr("y", function(d) {
                var ypos = self.y(self._valueAccessor(d));
                return ypos;
            })
            .attr("height", self.barHeight)
            .attr("x", function(d) {
                var xPos = self.x(d.Date);
                return xPos;
            })
            .attr("width", function(d) {
                var nextMonth = new Date(d.Date.getFullYear(), d.Date.getMonth() + 1, 1);

                var width = self.x(nextMonth) - self.x(d.Date);
                return width;
            })
            .on("mouseover", function(d) {
                self.mouseOver(self, this);
            })
            .on("mouseout", function(d) {
                self.mouseOut(self, this);
            })
            .attr("clip-path", "url(#clip)")
            .call(self.drag)
            .transition()
            .duration(500);

        var tips = this.chart.selectAll("text.tipValue")
            .data(this.dataset())
            .text(this.tooltipText);


    };


}


TimelineChart.prototype = Object.create(BaseChart.prototype);
TimelineChart.prototype.constructor = TimelineChart;
;var RowChart = function RowChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self.xFormatFunc(d);
        });

    this.initializeAxes = function() {
        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds()
                .end
            ]);

        this.y.domain(this.keys())
            .rangeRoundBands([0, this.yDomain()], 0.2);
    };

    this.rowWidth = function(d) {
        return this.x(this._valueAccessor(d));
    }.bind(this);

    this.yPosition = function(d) {
        return this.y(d.key);
    }.bind(this);

    this.rowHeight = function() {
        return this.y.rangeBand();
    }.bind(this);

    this.barXPosition = function(d) {
        var x = 0;
        if (this.invert()) {
            x = this.xBounds()
                .end - this.x(this._valueAccessor(d));
        }
        return x;
    }.bind(this);



    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();


        this.chart.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .attr('class', 'row-chart-y')
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter) {
                self.filterClick(this, filter);
            });

        this.draw();
    };


    this.draw = function() {

        var self = this;

        this.y
            .domain(this.keys())
            .rangeRoundBands([0, this.height()], 0.2);

        this.chart
            .selectAll("g.y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .each(function() {
                d3.select(this)
                    .classed('row-chart-y', 'true');
            })
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter) {
                self.filterClick(this, filter);
            });

        if (self._redrawAxes) {

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
            .on("mouseover", function(d, item) {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item) {
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
            .text(this._tooltipLabel);

        if (self._redrawAxes || self.orderable()) {
            trans
                .attr("y", this.yPosition)
                .attr("height", this.rowHeight);
        }



    };

    return this;
};


RowChart.prototype = Object.create(BaseChart.prototype);
RowChart.prototype.constructor = RowChart;
;function PartitionChart(name, element, dimension, group) {

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
        .children(function(d) {
            return d.values;
        })
        .value(function(d) {
            return d.ProjectedRevenue;
        });

    this.init = function() {

        var self = this;

        var g = this.vis.selectAll("g")
            .data(self.partition.nodes(this.group()))
            .enter()
            .append("svg:g")
            .attr("transform", function(d) {
                return "translate(" + x(d.y) + "," + y(d.x) + ")";
            })
            .on("click", click);

        var kx = w / this.group()
            .dx,
            ky = h / 1;

        g.append("svg:rect")
            .attr("width", this.group()
                .dy * kx)
            .attr("height", function(d) {
                return d.dx * ky;
            })
            .attr("class", function(d) {
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
            .style("opacity", function(d) {
                return d.dx * ky > 12 ? 1 : 0;
            })
            .text(function(d) {
                return d.key;
            });


        function transform(d) {
            return "translate(8," + d.dx * ky / 2 + ")";
        }

        function click(d) {
            if (!d.children) return;

            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([d.y, 1])
                .range([d.y ? 40 : 0, w]);
            y.domain([d.x, d.x + d.dx]);

            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function(d) {
                    return "translate(" + x(d.y) + "," + y(d.x) + ")";
                });

            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function(d) {
                    return d.dx * ky;
                });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function(d) {
                    return d.dx * ky > 12 ? 1 : 0;
                });

            d3.event.stopPropagation();
        }
    };


}

PartitionChart.prototype = Object.create(BaseChart.prototype);
PartitionChart.prototype.constructor = PartitionChart;
