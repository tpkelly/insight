var BaseChart = function BaseChart(name, element, dimension, group) {
    this.element = element;
    this.dimension = dimension;
    this.group = group;
    this._name = name;
    this._displayName = name;
    this._currentMax = 0;
    this._cumulative = false;
    this._labelFontSize = "11px";
    this._targets = null;
    this._series = [];
    this._ranges = [];
    this._redrawAxes = false;
    this.isFiltered = false;
    this.duration = 500;
    this.filters = [];
    this._labelPadding = 20;
    this.hasTooltip = false;
    this._tooltipText = "";
    this._invert = false;
    this._barColor = '#acc3ee';
    this._linkedCharts = [];

    this._margin = {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    };


    this._keyAccessor = function(d) {
        return d.key;
    };

    this._valueAccessor = function(d) {
        return d.value;
    };

    this._targetAccessor = function(d) {
        return d.value;
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
    this._yAxisFormat = function(d) {
        return d;
    };
    this._xAxisFormat = function(d) {
        return d;
    };

    this.xPosition = function(d) {
        return this.x(this._keyAccessor(d));
    }.bind(this);

    this.yPosition = function(d) {
        return this.y(this._valueAccessor(d));
    }.bind(this);

    this.rangeY = function(d, i) {
        return this.y(this._rangeAccessor(d));
    }.bind(this);

    this.rangeX = function(d, i) {

        var offset = i == (this.keys()
            .length - 1) ? this.x.rangeBand() : 0;

        return this.x(this._keyAccessor(d)) + offset;
    }.bind(this);

    this.barWidth = function(d) {
        return this.x.rangeBand();
    }.bind(this);

    this.barHeight = function(d) {
        return (this.height() - this.margin()
            .top - this.margin()
            .bottom) - this.y(this._valueAccessor(d));
    }.bind(this);

    this.targetY = function(d, i) {
        return this.y(this._targetAccessor(d));
    }.bind(this);

    this.targetX = function(d, i) {
        return this.x(this._keyAccessor(d)) + this.x.rangeBand() / 4;
    }.bind(this);

    this.targetWidth = function(d) {
        return this.x.rangeBand() / 2;
    }.bind(this);

    this.targetTooltipText = function(d) {
        return this._tooltipFormat(this._targetAccessor(d));
    }.bind(this);


    this.tooltipText = function(d) {
        return this._tooltipFormat(this._valueAccessor(d));
    }.bind(this);

    this.yDomain = function() {
        return this.height() - this.margin()
            .top - this.margin()
            .bottom;
    }.bind(this);

    this.xDomain = function() {
        return this.width() - this.margin()
            .left - this.margin()
            .right;
    }.bind(this);

};

BaseChart.prototype.displayName = function(name) {
    if (!arguments.length) {
        return this._displayName;
    }
    this._displayName = name;
    return this;
};

BaseChart.prototype.width = function(w) {
    if (!arguments.length) {
        return this._width;
    }
    this._width = w;
    return this;
};

BaseChart.prototype.height = function(h) {
    if (!arguments.length) {
        return this._height;
    }
    this._height = h;
    return this;
};


BaseChart.prototype.y = function(y) {
    if (!arguments.length) {
        return this._y;
    }
    this._y = y;
    return this;
};

BaseChart.prototype.x = function(x) {
    if (!arguments.length) {
        return this._x;
    }
    this._x = x;
    return this;
};

BaseChart.prototype.link = function(chart, follow) {

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

BaseChart.prototype.cumulative = function(v) {
    if (!arguments.length) {
        return this._cumulative;
    }
    this._cumulative = v;
    return this;
};

BaseChart.prototype.xAxisFormat = function(v) {
    if (!arguments.length) {
        return this.xFormatFunc;
    }
    this.xFormatFunc = v;
    return this;
};

BaseChart.prototype.updateMax = function(d) {
    var value = 0;

    var func;

    if (this._series.length) {
        for (var seriesFunction in this._series) {
            func = this.cumulative() ? this._series[seriesFunction].cumulative : this._series[seriesFunction].calculation;
            value += func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }
    } else {
        value = this._valueAccessor(d);
        this._currentMax = value > this._currentMax ? value : this._currentMax;
    }

    if (this._ranges.length) {
        for (var rangeFunction in this._ranges) {
            func = this._ranges[rangeFunction].calculation;
            value = func(d);
            this._currentMax = value > this._currentMax ? value : this._currentMax;
        }
    }
    return this._currentMax;
};

BaseChart.prototype.targetMax = function(d) {
    var value = 0;

    if (this._targets) {
        func = this.cumulative() ? this._targets.cumulative : this._targets.calculation;
        value = func(d);
        this._currentMax = value > this._currentMax ? value : this._currentMax;
    }
    return this._currentMax;
};

BaseChart.prototype.findMax = function() {
    var self = this;

    var max = d3.max(this.dataset(), function(d) {
        return self.updateMax(d);
    });

    if (this._targets) {
        var targetsmax = d3.max(this._targets.data.getData(), function(d) {
            return self.targetMax(d);
        });
        max = max > targetsmax ? max : targetsmax;
    }

    this.maxUpdatedEvent(max);

    return max;
};

BaseChart.prototype.zeroValueEntry = function(d) {
    var hasValue = 0;
    var func;

    if (this._series.length) {
        for (var seriesFunction in this._series) {
            func = this.cumulative() ? this._series[seriesFunction].cumulative : this._series[seriesFunction].calculation;

            hasValue = hasValue | (Math.round(func(d), 1) > 0);
        }
    } else {
        hasValue = hasValue | (Math.round(this._valueAccessor(d), 1) > 0);

    }
    if (this._targets) {
        func = this.cumulative() ? this._targets.cumulative : this._targets.calculation;
        hasValue = hasValue | (Math.round(func(d), 1) > 0);
    }
    return hasValue;
};


BaseChart.prototype.keys = function() {
    var self = this;

    var keys = [];

    if (this._redrawAxes) {
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

BaseChart.prototype.targets = function(targets) {
    if (!arguments.length) {
        return this._targets;
    }
    this._targets = targets;
    return this;
};

BaseChart.prototype.ranges = function(ranges) {
    if (!arguments.length) {
        return this._ranges;
    }
    this._ranges = ranges;
    return this;
};


BaseChart.prototype.createChart = function() {
    this.chart = d3.select(this.element)
        .append("svg")
        .attr("class", "chart");

    this.chart.attr("width", this.width())
        .attr("height", this.height());

    this.chart = this.chart.append("g")
        .attr("transform", "translate(" + this.margin()
            .left + "," + this.margin()
            .top + ")");

    this.tooltip();
};

BaseChart.prototype.topResults = function(top) {
    if (!arguments.length) {
        return this._topResults;
    }
    this._topResults = top;
    return this;
};

BaseChart.prototype.dataset = function() {
    return this.group.getData()
        .filter(this._limitFunction);
};

BaseChart.prototype.targetData = function() {
    return this._targets.data.getData()
        .filter(this._limitFunction);
};

BaseChart.prototype.keyAccessor = function(k) {
    if (!arguments.length) {
        return this._keyAccessor;
    }
    this._keyAccessor = k;
    return this;
};

BaseChart.prototype.labelAccessor = function(k) {
    if (!arguments.length) {
        return this._labelAccessor;
    }
    this._labelAccessor = k;
    return this;
};

BaseChart.prototype.tooltipFormat = function(f) {
    if (!arguments.length) {
        return this._tooltipFormat;
    }
    this._tooltipFormat = f;
    return this;
};


BaseChart.prototype.yAxisFormat = function(f) {
    if (!arguments.length) {
        return this._yAxisFormat;
    }
    this._yAxisFormat = f;
    return this;
};

BaseChart.prototype.valueAccessor = function(v) {
    if (!arguments.length) {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};

BaseChart.prototype.redrawAxes = function(v) {
    if (!arguments.length) {
        return this._redrawAxes;
    }
    this._redrawAxes = v;
    return this;
};

BaseChart.prototype.margin = function(m) {
    if (!arguments.length) {
        return this._margin;
    }
    this._margin = m;
    return this;
};


BaseChart.prototype.draw = function() {

};

BaseChart.prototype.init = function() {


};

BaseChart.prototype.invert = function(i) {

    if (!arguments.length) {
        return this._invert;
    }
    this._invert = i;
    return this;

};

BaseChart.prototype.setHover = function() {
    d3.select(this)
        .classed("active", true);
};


BaseChart.prototype.removeHover = function() {
    d3.select(this)
        .classed("active", false);
};

BaseChart.prototype.mouseOver = function(chart, item, d) {
    if (chart.hasTooltip) {
        var tipValue = $(item)
            .find('.tipValue')
            .first()
            .html();
        var tipLabel = $(item)
            .find('.tipLabel')
            .first()
            .html();

        chart.tip.show({
            label: tipLabel,
            value: tipValue
        });
    }

    d3.select(item)
        .classed("active", true);
};

BaseChart.prototype.mouseOut = function(chart, item, d) {
    if (chart.hasTooltip) {
        chart.tip.hide(d);
    }

    d3.select(item)
        .classed("active", false);
};

BaseChart.prototype.labelColor = function(c) {
    if (!arguments.length) {
        return this._labelColor;
    }
    this._labelColor = c;
    return this;
};

BaseChart.prototype.barColor = function(c) {
    if (!arguments.length) {
        return this._barColor;
    }
    this._barColor = c;
    return this;
};

BaseChart.prototype.tooltipLabel = function(label) {
    if (!arguments.length) {
        return this._tooltipLabel;
    }
    this._tooltipLabel = label;
    return this;
};

BaseChart.prototype.tooltip = function() {
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

BaseChart.prototype.filterKey = function() {};


BaseChart.prototype.limitFunction = function(d) {
    if (!arguments.length) {
        return this._limitFunction;
    }
    this._limitFunction = d;
    return this;
};


BaseChart.prototype.labelPadding = function(p) {
    if (!arguments.length) {
        return this._labelPadding;
    }
    this._labelPadding = p;
    return this;
};

BaseChart.prototype.labelFontSize = function(s) {
    if (!arguments.length) {
        return this._labelFontSize;
    }
    this._labelFontSize = s;
    return this;
};

BaseChart.prototype.xBounds = function(d) {

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

BaseChart.prototype.yBounds = function(d) {

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

BaseChart.prototype.labelAnchoring = function(d) {
    if (this.invert()) {
        return "end";
    } else {
        return "start";
    }
};

BaseChart.prototype.filterFunction = function(filter) {
    var value = filter.key ? filter.key : filter;

    return {
        name: value,
        filterFunction: function(d) {
            return d == value;
        }
    };
};


BaseChart.prototype.filterClick = function(element, filter) {
    if (d3.select(element)
        .classed("selected")) {
        d3.select(element)
            .classed("selected", false);
    } else {
        d3.select(element)
            .classed("selected", true);
    }

    var filterFunction = this.filterFunction(filter);

    this.filterEvent(this, filterFunction);
};


BaseChart.prototype.triggerRedraw = function() {

};

BaseChart.prototype.filterEvent = function(data, dimension, filter) {

};

BaseChart.prototype.maxUpdatedEvent = function(max) {

    this._linkedCharts.forEach(function(chart) {

        chart._currentMax = chart._currentMax < max ? max : chart._currentMax;
    });
};

BaseChart.prototype.updateTargets = function() {};
BaseChart.prototype.drawTargets = function() {};
