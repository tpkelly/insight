function BarChart(name, element, dimension, group) {

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
        return self.y(self._valueAccessor(d));
    };

    var targetYPosition = function(d, i) {
        return self.y(func(d));
    };

    var barWidth = function(d) {
        return self.x.rangeBand();
    };

    var barHeight = function(d) {
        return (self.height() - self.margin().top - self.margin().bottom) - self.y(self._valueAccessor(d));
    };

    var mouseOver = function(d, item) {
        self.mouseOver(self, this, d);
    };
    var mouseOut = function(d, item) {
        self.mouseOut(self, this, d);
    };

    var tooltipText = function(d) {
        return self._tooltipFormat(self._valueAccessor(d));
    };

    var targetTooltipText = function(d) {
        return self._tooltipFormat(func(d));
    };

    var tooltipLabel = function(d) {
        return self._targets.label;
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
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("width", barWidth)
            .attr("height", barHeight)
            .attr("fill", this._barColor)
            .on("mouseover", mouseOver)
            .on("mouseout", mouseOut);

        bars.append("svg:text")
            .text(tooltipText)
            .attr("class", "tipValue");

        bars.append("svg:text")
            .text(function(d) {
                return self.tooltipLabel();
            })
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
            .attr("transform", "translate(0," + (self.height() - self.margin().bottom - self.margin().top) + ")")
            .call(this.xAxis)
            .selectAll("text")
            .attr("class", "x-axis")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .on("mouseover", function() {
                self.setHover(this);
            })
            .on("mouseout", function() {
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
            .transition()
            .duration(self.duration)
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("width", barWidth)
            .attr("height", barHeight);

        bars.selectAll("text.tipValue")
            .text(tooltipText);


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
        var self = this;

        if (this._targets) {

            func = self._targets.calculation;
            label = self._targets.label;

            var tBars = this.chart.selectAll("rect.target")
                .data(this.targetData())
                .enter()
                .append("rect")
                .attr("class", "target " + self._targets.name + "class")
                .attr("x", xPosition)
                .attr("y", targetYPosition)
                .attr("width", barWidth)
                .attr("height", 4)
                .attr("fill", self._targets.color)
                .on("mouseover", mouseOver)
                .on("mouseout", mouseOut);

            tBars.append("svg:text")
                .text(targetTooltipText)
                .attr("class", "tipValue");

            tBars.append("svg:text")
                .text(label)
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

        if (this._targets) {

            func = self._targets.calculation;

            var tBars = this.chart.selectAll("rect.target")
                .data(this.targetData())
                .transition()
                .duration(self.duration)
                .attr("y", targetYPosition);

            tBars.selectAll("text.tipValue")
                .text(targetTooltipText)
                .attr("class", "tipValue");

        }
    };

}


BarChart.prototype = Object.create(BaseChart.prototype);
BarChart.prototype.constructor = BarChart;
