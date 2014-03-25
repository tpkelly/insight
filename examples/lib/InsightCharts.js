function Group(data) {
    this._data = data;
}

Group.prototype.filterFunction = function(f) {
    if (!arguments.length) {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Group.prototype.getData = function() {
    var data = this._data.all();

    if (this._filterFunction) {
        data = this._data.all()
            .filter(this._filterFunction);
    }
    return data;
};



function CumulativeGroup(data, filterFunction) {
    Group.call(this, data);

    this.cumulative = true;
    this._filterFunction = filterFunction;
    this._valueAccessor = function(d) {
        return d;
    };
}

CumulativeGroup.prototype = Object.create(Group.prototype);
CumulativeGroup.prototype.constructor = CumulativeGroup;

CumulativeGroup.prototype.valueAccessor = function(v) {
    if (!arguments.length) {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};

CumulativeGroup.prototype.calculateTotals = function() {
    var totals = {};
    var self = this;

    this.getData()
        .forEach(function(d, i) {

            var value = self._valueAccessor(d);

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
        });

    return this;
};
;var Dimension = function Dimension(name, dimension, displayFunction) {
    this.Dimension = dimension;
    this.Name = name;
    this.Filters = ko.observableArray();
    this.Keys = this.Dimension.group()
        .all()
        .map(function(d) {
            return d.key;
        });
    this.displayFunction = displayFunction ? displayFunction : function(d) {
        return d;
    };
};
;var ChartGroup = function ChartGroup(name) {
    this.Name = name;
    this.Charts = ko.observableArray();
    this.Dimensions = ko.observableArray();
    this.Groups = ko.observableArray();
    this.CumulativeGroups = ko.observableArray();
    this.LinkedCharts = [];
};

ChartGroup.prototype.initCharts = function() {
    this.Charts()
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
    var dimension = new Dimension(name, ndx.dimension(func), displayFunc);

    this.Dimensions.push(dimension);

    return dimension;
};


ChartGroup.prototype.chartFilterHandler = function(chart, filterFunction) {

    var self = this;

    var dims = this.Dimensions()
        .filter(function(d) {
            return d.Name == chart.dimension.Name;
        });

    dims.map(function(dim) {

        if (dim.Filters) {

            var filterExists = dim.Filters()
                .filter(function(d) {
                    return d.name == filterFunction.name;
                })
                .length;

            //if the dimension is already filtered by this value, toggle (remove) the filter
            if (filterExists) {
                dim.Filters.remove(function(filter) {
                    return filter.name == filterFunction.name;
                });
            } else {
                // add the provided filter to the list for this dimension
                dim.Filters.push(filterFunction);
            }
        }

        // reset this dimension if no filters exist, else apply the filter to the dataset.
        if (dim.Filters()
            .length === 0) {
            dim.Dimension.filterAll();
        } else {
            dim.Dimension.filter(function(d) {
                var vals = dim.Filters()
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

    this.CumulativeGroups()
        .forEach(
            function(group) {
                group.calculateTotals();
            }
    );

    this.redrawCharts();
};



ChartGroup.prototype.redrawCharts = function() {
    for (var i = 0; i < this.Charts()
        .length; i++) {
        this.Charts()[i].draw();
    }
};

ChartGroup.prototype.addSumGrouping = function(dimension, func) {
    var data = dimension.Dimension.group()
        .reduceSum(func);
    var group = new Group(data, false);

    this.Groups.push(group);
    return group;
};

ChartGroup.prototype.addCustomGrouping = function(group) {
    this.Groups.push(group);
    if (group.cumulative) {
        this.CumulativeGroups.push(group);
    }
    return group;
};
;var BaseChart = function BaseChart(name, element, dimension, group) {
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

    this.rangeX = function (d, i) {

        var offset = i == (this.keys().length - 1) ? this.x.rangeBand() : 0;

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

BaseChart.prototype.link = function (chart, follow) {

    if (this._linkedCharts.indexOf(chart) == -1) {
        this._linkedCharts.push(chart);

        if (follow) {
            this._linkedCharts.forEach(function (c) {
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

BaseChart.prototype.maxUpdatedEvent = function (max) {
    
    this._linkedCharts.forEach(function (chart) {

        chart._currentMax = chart._currentMax < max ? max : chart._currentMax;
    });
};

BaseChart.prototype.updateTargets = function() {};
BaseChart.prototype.drawTargets = function() {};
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
;function BarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();

    this.xFormatFunc = function(d) {
        return d;
    };

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(0)
        .tickFormat(function(d) {
            return self._yAxisFormat(d);
        });

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickSize(0)
        .tickFormat(function(d) {
            return self.xFormatFunc(d);
        });


    this.initializeAxes = function() {

        this.x.domain(this.keys())
            .rangeRoundBands([0, this.xDomain()], 0.3);

        this.y.domain([0, this._currentMax])
            .range([this.yDomain(), 0]);
    };

    this.init = function() {
        var self = this;

        this.createChart();

        this._currentMax = this.findMax();

        this.initializeAxes();

        if (this._ranges.length) {
            this.drawRanges();
        }

        var bars = this.chart.selectAll("rect.bar")
            .data(this.dataset())
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", this.xPosition)
            .attr("y", this.yPosition)
            .attr("width", this.barWidth)
            .attr("height", this.barHeight)
            .attr("fill", this._barColor)
            .on("mouseover", function(d) {
                self.mouseOver(self, this);
            })
            .on("mouseout", function(d) {
                self.mouseOut(self, this);
            });

        bars.append("svg:text")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        bars.append("svg:text")
            .text(this._tooltipLabel)
            .attr("class", "tipLabel");


        if (this._targets) {
            this.drawTargets();
        }

        this.drawAxes();
    };

    this.drawAxes = function() {
        var self = this;

        this.chart.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        this.chart.append("g")
            .attr("transform", "translate(0," + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ")")
            .call(this.xAxis)
            .selectAll("text")
            .attr("class", "x-axis")
            .style("text-anchor", "start")
            .style("writing-mode", "tb")
            .style("font-size", "12px")
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter) {
                return self.filterClick(this, filter);
            });

    };

    this.draw = function() {

        if (self._redrawAxes) {
            this.y.domain([0, self.findMax()])
                .range([this.height() - this.margin()
                    .top - this.margin()
                    .bottom, 0
                ]);
        }

        var bars = self.chart.selectAll("rect")
            .data(this.dataset())
            .transition()
            .duration(this.duration)
            .attr("x", this.xPosition)
            .attr("y", this.yPosition)
            .attr("width", this.barWidth)
            .attr("height", this.barHeight);

        bars.selectAll("text.tipValue")
            .text(this.tooltipText);

        if (this._targets) {
            this.updateTargets();
        }

        this.chart.selectAll("g.y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333");
    };

    this.drawTargets = function() {

        if (this._targets) {

            this._targetAccessor = this._targets.calculation;

            var tBars = this.chart.selectAll("rect.target")
                .data(this.targetData())
                .enter()
                .append("rect")
                .attr("class", "target " + this._targets.name + "class")
                .attr("x", this.xPosition)
                .attr("y", this.targetY)
                .attr("width", this.barWidth)
                .attr("height", 4)
                .attr("fill", this._targets.color)
                .on("mouseover", function(d) {
                    self.mouseOver(self, this);
                })
                .on("mouseout", function(d) {
                    self.mouseOut(self, this);
                });

            tBars.append("svg:text")
                .text(this.targetTooltipText)
                .attr("class", "tipValue");

            tBars.append("svg:text")
                .text(this._targets.label)
                .attr("class", "tipLabel");
        }
    };

    this.drawRanges = function() {

        if (this._ranges) {
            for (var range in this._ranges) {

                this._rangeAccessor = this._ranges[range].calculation;

                var transform = this._ranges[range].type(this);

                this.chart.append("svg:path")
                    .datum(this.dataset())
                    .attr("d", transform)
                    .attr("fill", self._ranges[range].color)
                    .attr("class", self._ranges[range].class);
            }
        }
    };


    this.updateTargets = function() {

        if (this._targets) {

            var tBars = this.chart.selectAll("rect.target")
                .data(this.targetData())
                .transition()
                .duration(this.duration)
                .attr("y", this.targetY);

            tBars.selectAll("text.tipValue")
                .text(this.targetTooltipText)
                .attr("class", "tipValue");
        }
    };

}


BarChart.prototype = Object.create(BaseChart.prototype);
BarChart.prototype.constructor = BarChart;
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

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();

    this.xFormatFunc = function(d) {
        return d;
    };

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self._yAxisFormat(d);
        });

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

    this.initializeAxes = function() {
        this.x.domain(this.keys())
            .rangeRoundBands([0, this.xDomain()], 0.2);

        this.y.domain([0, this.findMax()])
            .range([this.yDomain(), 0]);
    };

    this.addSeries = function(series) {

        if (!arguments.length) {
            return this._series;
        }
        this._series = series;
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

        var groups = this.chart
            .selectAll("g")
            .data(this.dataset());

        groups.enter()
            .append("g")
            .attr("class", "bargroup");

        var bars = groups.selectAll('rect.bar');


        for (var seriesFunction in this._series) {
            this._valueAccessor = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            bars = groups.append("rect")
                .attr("class", self._series[seriesFunction].name + "class bar")
                .attr("x", this.xPosition)
                .attr("y", this.yPosition)
                .attr("width", this.barWidth)
                .attr("height", this.barHeight)
                .attr("fill", this._series[seriesFunction].color)
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            bars.append("svg:text")
                .text(this.tooltipText)
                .attr("class", "tipValue");

            bars.append("svg:text")
                .text(this._series[seriesFunction].label)
                .attr("class", "tipLabel");
        }

        this.chart.append("g")
            .attr("class", "y-axis")
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
            .attr("class", "x-axis")
            .style("font-size", "12px")
            .style("text-anchor", "start")
            .style("writing-mode", "tb")
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter) {
                return self.filterClick(this, filter);
            });

        if (this._targets) {
            this.drawTargets();
        }
    };


    this.draw = function() {

        var self = this;

        if (self.redrawAxes()) {
            this.y.domain([0, d3.round(self.findMax(), 1)])
                .range([this.height() - this.margin()
                    .top - this.margin()
                    .bottom, 0
                ]);
        }

        var groups = this.chart.selectAll("g.bargroup")
            .data(this.dataset())
            .each(function(d, i) {
                d.yPos = 0;
            });

        for (var seriesFunction in this._series) {

            this._valueAccessor = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            var bars = groups.selectAll("." + self._series[seriesFunction].name + "class.bar")
                .transition()
                .duration(self.duration)
                .attr("x", this.xPosition)
                .attr("y", this.yPosition)
                .attr("height", this.barHeight);

            bars.selectAll("text.tipValue")
                .text(this.tooltipText);

            bars.selectAll("text.tipLabel")
                .text(this._series[seriesFunction].label);

        }

        if (this._targets) {
            this.updateTargets();
        }

        this.chart.selectAll(".y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .style("font-size", "12px")
            .style("fill", "#333");
    };


    this.drawTargets = function() {

        var mouseOver = function(d, item) {
            self.mouseOver(self, this, d);
        };
        var mouseOut = function(d, item) {
            self.mouseOut(self, this, d);
        };

        var groups = this.chart.selectAll("g")
            .data(this.targetData());

        if (this._targets) {

            this._targetAccessor = this.cumulative() ? self._targets.cumulative : self._targets.calculation;


            var tBars = groups.append("rect")
                .attr("class", this._targets.name + "class target")
                .attr("x", this.targetX)
                .attr("y", this.targetY)
                .attr("width", this.targetWidth)
                .attr("height", 4)
                .attr("fill", this._targets.color)
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            tBars.append("svg:text")
                .text(this.targetTooltipText)
                .attr("class", "tipValue");

            tBars.append("svg:text")
                .text(this._targets.label)
                .attr("class", "tipLabel");
        }
    };

    this.updateTargets = function() {

        var groups = this.chart.selectAll("g")
            .data(this.targetData());

        if (this._targets) {

            this._valueAccessor = this.cumulative() ? self._targets.cumulative : self._targets.calculation;

            var tBars = groups.selectAll("rect." + self._targets.name + "class.target");

            tBars.transition()
                .duration(this.duration)
                .attr("y", this.targetY);

            tBars.selectAll("text.tipValue")
                .text(this.targetTooltipText)
                .attr("class", "tipValue");
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

        this.x = d3.scale.linear()
            .domain([0, this.maxRange])
            .range([0, this.width() - this.margin()
                .right - this.margin()
                .left
            ]);

        this.y = d3.time.scale()
            .domain(this.range)
            .range([0, this.height()]);

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .tickSize(0)
            .orient('right');
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

        if (minExtent.getTime() != maxExtent.getTime()) {

            this.filterEvent(this, func);

            self.mini.select('.brush')
                .call(self.brush.extent([minExtent, maxExtent]));
        } else {
            this.dimension.Dimension.filterAll();
            this.triggerRedraw();
        }

    };


    this.init = function() {
        var self = this;
        this.createChart();
        this.initializeAxes();

        this.mini = this.chart.append('g')
            .attr('width', function() {
                return self.width();
            })
            .attr('height', function() {
                return self.height();
            })
            .attr('class', 'mini');

        this.brush = d3.svg.brush()
            .y(this.y)
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
            .attr('x', 60)
            .attr('y', function(d) {
                return self.y(self._keyAccessor(d));
            })
            .attr('width', function(d) {
                return self.x(self._valueAccessor(d) - self.margin()
                    .right - self.margin()
                    .left);
            })
            .attr('height', 3)
            .attr('fill', self._barColor);

        self.mini.append('g')
            .attr('class', 'y axis')

        .style('font-size', '11px')
            .call(self.yAxis);

        self.mini.append('g')
            .attr('class', 'x brush')
            .call(self.brush)
            .selectAll('rect')
            .attr('width', self.width())
            .attr('fill', self._brushColor)
            .style('opacity', '0.5');
    };


    this.draw = function() {
        var self = this;

        //mini item rects
        self.chart.selectAll('rect.mini')
            .data(this.dataset())
            .transition()
            .duration(self.duration)
            .attr('y', function(d) {
                return self.y(self._keyAccessor(d));
            })
            .attr('width', function(d) {
                return self.x(self._valueAccessor(d));
            });

    };
}


TimeLine.prototype = Object.create(BaseChart.prototype);
TimeLine.prototype.constructor = TimeLine;
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

        var bars = this.chart.append("g")
            .selectAll("rect")
            .data(this.dataset())
            .enter()
            .append("rect")
            .attr("x", this.barXPosition)
            .attr("y", this.yPosition)
            .attr("width", this.rowWidth)
            .attr("height", this.rowHeight)
            .attr("fill", this.barColor())
            .on("mouseover", function(d, item) {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item) {
                self.mouseOut(self, this, d);
            });

        this.chart.selectAll("rect")
            .data(this.dataset())
            .exit()
            .remove();

        bars.append("svg:text")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        bars.append("svg:text")
            .text(this._tooltipLabel)
            .attr("class", "tipLabel");

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
    };

    this.draw = function() {

        var self = this;

        if (self._redrawAxes) {

            this.y
                .domain(this.keys())
                .rangeRoundBands([0, this.height()], 0.2);

            this.x.domain([0, this.findMax()])
                .range([0, this.xBounds()
                    .end
                ]);

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
        }

        var bars = self.chart.selectAll("rect")
            .data(this.dataset())
            .transition()
            .duration(self.duration)
            .attr("width", this.rowWidth);

        bars.selectAll("text.tipValue")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        if (self._redrawAxes) {
            bars.attr("y", this.yPosition)
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
