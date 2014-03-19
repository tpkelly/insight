function BarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();

    this.xFormatFunc = function(d) {
        return d;
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

    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();

        var bars = this.chart.selectAll("rect.bar")
            .data(this.dataset())
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d, i) {
                return self.x(self._keyAccessor(d));
            })
            .attr("y", function(d, i) {
                return self.y(self._valueAccessor(d));
            })
            .attr("width", function(d) {
                return self.x.rangeBand();
            })
            .attr("height", function(d) {
                return (self.height() - self.margin().top - self.margin().bottom) - self.y(self._valueAccessor(d));
            })
            .attr("fill", this._barColor)
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


        if (this._targets.length) {
            this.drawTargets();
        }



        this.chart.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        this.chart.append("g")
            .attr("transform", "translate(0," + (self.height() - self.margin().bottom - self.margin().top) + ")")
            .call(this.xAxis)
            .selectAll("text")
            .attr("class", "x-axis")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .on("mouseover", function(d, item) {
                self.setHover(this);
            })
            .on("mouseout", function(d, item) {
                self.removeHover(this);
            })
            .on("click", function(filter) {
                return self.filterClick(this, filter);
            })
            .attr("transform", function(d) {
                return "rotate(-90," + 0 + "," + 15 + ")";
            });

        if (this._ranges.length) {
            this.drawRanges();
        }
    };

    this.draw = function() {

        var self = this;
        if (self._redrawAxes) {
            this.y.domain([0, self.findMax()]).range([this.height() - this.margin().top - this.margin().bottom, 0]);
        }

        var bars = self.chart.selectAll("rect")
            .data(this.dataset())
            .transition().duration(self.duration)
            .attr("x", function(d, i) {
                return self.x(self._keyAccessor(d));
            })
            .attr("y", function(d, i) {
                return self.y(self._valueAccessor(d));
            })
            .attr("width", function(d) {
                return self.x.rangeBand();
            })
            .attr("height", function(d) {
                return (self.height() - self.margin().top - self.margin().bottom) - self.y(self._valueAccessor(d));
            });

        bars.selectAll("text.tipValue")
            .text(function(d) {
                return self._tooltipFormat(self._valueAccessor(d));
            });

        bars.selectAll("text.tipLabel")
            .text(function(d) {
                return self.tooltipLabel();
            });

        if (this._targets.length) {
            this.updateTargets();
        }

        this.chart.selectAll("g.y-axis").call(this.yAxis).selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333");
    };

    this.drawTargets = function() {
        var self = this;

        var func;

        var xPosition = function(d, i) {
            return self.x(self._keyAccessor(d));
        };
        var yPosition = function(d, i) {
            return self.y(func(d));
        };
        var width = function(d) {
            return self.x.rangeBand();
        };
        var mouseOver = function(d, item) {
            self.mouseOver(self, this, d);
        };
        var mouseOut = function(d, item) {
            self.mouseOut(self, this, d);
        };
        var tooltipValue = function(d) {
            return self._tooltipFormat(func(d));
        };
        var tooltipLabel = function(d) {
            return self._targets[target].label;
        };

        for (var target in this._targets) {

            func = self._targets[target].calculation;

            var tBars = this.chart.selectAll("rect.target")
                .data(this.dataset())
                .enter()
                .append("rect")
                .attr("class", "target " + self._targets[target].name + "class")
                .attr("x", xPosition)
                .attr("y", yPosition)
                .attr("width", width)
                .attr("height", 4)
                .attr("fill", self._targets[target].color)
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            tBars.append("svg:text")
                .text(tooltipValue)
                .attr("class", "tipValue");

            tBars.append("svg:text")
                .text(tooltipLabel)
                .attr("class", "tipLabel");
        }
    };


    this.drawRanges = function() {
        var self = this;

        var func;

        var xPosition = function(d, i) {
            return self.x(self._keyAccessor(d));
        };
        var yPosition = function(d, i) {
            return self.y(func(d));
        };

        for (var range in this._ranges) {
            func = self._ranges[range].calculation;
            var line = d3.svg.line()
                .x(xPosition)
                .y(yPosition);

            this.chart.append("svg:path")
                .attr("d", line(this.dataset()))
                .attr("stroke", self._ranges[range].color)
                .attr("stroke-width", 1)
                .attr("fill", 'none');

        }
    };



    this.updateTargets = function() {
        var self = this;

        var func;

        var yPosition = function(d, i) {
            return self.y(func(d));
        };
        var tooltipValue = function(d) {
            return self._tooltipFormat(func(d));
        };
        var tooltipLabel = function(d) {
            return self._targets[target].label;
        };

        for (var target in this._targets) {

            func = self._targets[target].calculation;

            var tBars = this.chart.selectAll("rect.target")
                .data(this.dataset())
                .transition()
                .duration(self.duration)
                .attr("y", yPosition);

            tBars.selectAll("text.tipValue")
                .text(tooltipValue)
                .attr("class", "tipValue");

            tBars.selectAll("text.tipLabel")
                .text(tooltipLabel)
                .attr("class", "tipLabel");
        }
    };

}


BarChart.prototype = Object.create(BaseChart.prototype);
BarChart.prototype.constructor = BarChart;
