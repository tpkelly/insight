function StackedBarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();

    this.xFormatFunc = function(d) {
        return d;
    };

    var func;

    var xPosition = function(d) {
        return self.x(self._keyAccessor(d));
    };

    var yPosition = function(d) {
        return self.y(self.calculateYPos(func, d));
    };

    var targetYPosition = function(d, i) {
        return self.y(func(d));
    };

    var barWidth = function(d) {
        return self.x.rangeBand();
    };

    var barHeight = function(d) {
        return (self.height() - self.margin().top - self.margin().bottom) - self.y(func(d));
    };

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };

    var tooltipText = function(d) {
        return self._tooltipFormat(func(d));
    };



    this.yAxis = d3.svg.axis()
        .scale(this.y).orient("left").tickSize(0).tickPadding(10).tickFormat(function(d) {
            return self._yAxisFormat(d);
        });

    this.xAxis = d3.svg.axis()
        .scale(this.x).orient("bottom").tickSize(0).tickPadding(10).tickFormat(function(d) {
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

    this.initializeAxes = function() {
        this.x.domain(this.keys())
            .rangeRoundBands([0, this.width() - this.margin().left - this.margin().right], 0.2);

        this.y.domain([0, this.findMax()])
            .range([this.height() - this.margin().top - this.margin().bottom, 0]);
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

    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();

        var groups = this.chart.selectAll("g")
            .data(this.dataset());

        groups.enter().append("g").attr("class", "bargroup");

        var bars = groups.selectAll('rect.bar');

        var tooltipLabel = function(d) {
            return self._series[seriesFunction].label;
        };

        for (var seriesFunction in this._series) {
            func = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            bars = groups.append("rect")
                .attr("class", self._series[seriesFunction].name + "class bar")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("width", barWidth)
                .attr("height", barHeight)
                .attr("fill", self._series[seriesFunction].color)
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            bars.append("svg:text")
                .text(tooltipText)
                .attr("class", "tipValue");

            bars.append("svg:text")
                .text(tooltipLabel)
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
            .attr("transform", "translate(0," + (self.height() - self.margin().bottom - self.margin().top) + ")")
            .call(this.xAxis)
            .selectAll("text")
            .attr("class", "x-axis")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .attr("transform", function(d) {
                return "rotate(-90," + 0 + "," + 15 + ")";
            })
            .on("mouseover", function(d, item) {
                self.setHover(this);
            })
            .on("mouseout", function(d, item) {
                self.removeHover(this);
            })
            .on("click.mine", function(filter) {
                console.log('click');
                return self.filterClick(this, filter);
            });

        if (this._targets) {
            this.drawTargets();
        }
    };


    this.draw = function() {

        var self = this;

        if (self.redrawAxes()) {
            this.y.domain([0, d3.round(self.findMax(), 1)]).range([this.height() - this.margin().top - this.margin().bottom, 0]);
        }

        var groups = this.chart.selectAll("g.bargroup")
            .data(this.dataset())
            .each(function(d, i) {
                d.yPos = 0;
            });

        var func = this._valueAccessor;

        var key = function(d, i) {
            return self.x(self._keyAccessor(d));
        };
        var value = function(d, i) {
            return self.y(self.calculateYPos(func, d));
        };
        var width = function(d) {
            return self.x.rangeBand();
        };
        var height = function(d) {
            return (self.height() - self.margin().top - self.margin().bottom) - self.y(func(d));
        };
        var mouseOver = function(d, item) {
            self.mouseOver(self, this, d);
        };
        var mouseOut = function(d, item) {
            self.mouseOut(self, this, d);
        };
        var tooltipText = function(d) {
            return self._tooltipFormat(func(d));
        };
        var tooltipLabel = function(d) {
            return self._series[seriesFunction].label;
        };


        for (var seriesFunction in this._series) {

            func = this.cumulative() ? self._series[seriesFunction].cumulative : self._series[seriesFunction].calculation;

            var bars = groups.selectAll("." + self._series[seriesFunction].name + "class.bar")
                .transition().duration(self.duration)
                .attr("x", key)
                .attr("y", value)
                .attr("height", height);

            bars.selectAll("text.tipValue")
                .text(tooltipText);

            bars.selectAll("text.tipLabel")
                .text(tooltipLabel);

        }

        if (this._targets) {
            this.updateTargets();
        }

        this.chart.selectAll(".y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333");
    };


    this.drawTargets = function() {

        var targetX = function(d, i) {
            return self.x(self._keyAccessor(d)) + self.x.rangeBand() / 4;
        };
        var targetY = function(d, i) {
            return self.y(func(d));
        };
        var targetWidth = function(d) {
            return self.x.rangeBand() / 2;
        };
        tooltipText = function(d) {
            return self._tooltipFormat(func(d));
        };
        tooltipLabel = function(d) {
            return self._targets.label;
        };

        var mouseOver = function(d, item) {
            self.mouseOver(self, this, d);
        };
        var mouseOut = function(d, item) {
            self.mouseOut(self, this, d);
        };

        var groups = this.chart.selectAll("g")
            .data(this.targetData());

        if (this._targets) {

            func = this.cumulative() ? self._targets.cumulative : self._targets.calculation;

            var tBars = groups.append("rect")
                .attr("class", self._targets.name + "class target")
                .attr("x", targetX)
                .attr("y", targetY)
                .attr("width", targetWidth)
                .attr("height", 4)
                .attr("fill", self._targets.color)
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            tBars.append("svg:text")
                .text(tooltipText)
                .attr("class", "tipValue");

            tBars.append("svg:text")
                .text(tooltipLabel)
                .attr("class", "tipLabel");
        }
    };

    this.updateTargets = function() {

        var targetY = function(d) {
            return self.y(func(d));
        };
        tooltipText = function(d) {
            return self._tooltipFormat(func(d));
        };

        var groups = this.chart.selectAll("g")
            .data(this.targetData());

        if (this._targets) {

            func = this.cumulative() ? self._targets.cumulative : self._targets.calculation;

            var tBars = groups.selectAll("rect." + self._targets.name + "class.target");

            tBars.transition()
                .duration(this.duration)
                .attr("y", targetY);

            tBars.selectAll("text.tipValue")
                .text(tooltipText)
                .attr("class", "tipValue");
        }
    };

}


StackedBarChart.prototype = Object.create(BaseChart.prototype);
StackedBarChart.prototype.constructor = StackedBarChart;
