

function GroupedBarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.groupNames = [];
    this.x = d3.scale.ordinal();
    this.subX = d3.scale.ordinal();

    this.y = d3.scale.linear();

    this.xFormatFunc = function (d) {
        return d;
    }

    this.color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

    this.yAxis = d3.svg.axis()
					  .scale(this.y).orient("left").tickSize(0).tickPadding(10);

    this.xAxis = d3.svg.axis()
                      .scale(this.x).orient("bottom").tickSize(0).tickPadding(10).tickFormat(function (d) { return self.xFormatFunc(d); });

    this.xAxisFormat = function (f) {
        this.xFormatFunc = f;
        return this;
    }

    this.labelAnchoring = function (d) {
        if (this.invert()) {
            return "start";
        }
        else { return "end"; }
    };

    this.groupNames = function (d) {
        if (!arguments) { return this._groupNames; }
        this._groupNames = d;
        return this;
    }

    this.yScaleMax = function () {

        var max = d3.max(this.group().all(), function (d) {
            var m = 0;

            m = m < d.value.Total ? d.value.Total : m;

            return m;
        });
        return max;
    };

    this.initializeAxes = function () {

        this.x.domain(this.keys())
                .rangeRoundBands([0, this.width() - this.margin().left - this.margin().right], 0.2);
        this.subX.domain(this._groupNames).rangeRoundBands([0, this.x.rangeBand()], 0.1);

        this.y.domain([0, this.yScaleMax()])
                .range([this.height() - this.margin().top - this.margin().bottom, 0]);
    }

    this.filterKey = function (d) {
        return d.key;
    }

    this.labelYPosition = function (d) {
        var yPos = self.height() - self.yBounds().start;

        if (self.invert()) {
            yPos = self.yBounds().start;
        }
        return yPos;
    }


    this.barYPosition = function (d) {

        var y = self.height() - self.yBounds().start - self.y(d.value);

        var invert = self.invert();

        if (invert) {
            y = self.yBounds().start;
        }
        return y;
    }

    this.init = function () {
        var self = this;

        this.createChart();
        this.initializeAxes();

        var groups = this.chart.selectAll(".group")
                        .data(this.dataset())
                        .enter().append("g")
                            .attr("class", "group")
                            .attr("transform", function (d) {
                                return "translate(" + self.x(self._keyAccessor(d)) + ",0)";
                            })

        var total = groups.append("rect")
                .attr("class", "total")
                .attr("width", this.x.rangeBand())
                .attr("x", 0)
                .attr("y", function (d) { return self.y(d.value.Total); })
                .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(d.value.Total); })
                .attr("fill", "silver")
                .on("mouseover", function (d, item) { self.mouseOver(self, this, d); })
                .on("mouseout", function (d, item) { self.mouseOut(self, this, d); });

        total.append("svg:text")
            .text(function (d) { return self.tooltipLabel(); })
            .attr("class", "tipLabel");

        total.append("svg:text")
            .text(function (d) { return self._tooltipFormat(d.value.Total); })
            .attr("class", "tipValue");

        var bars = groups.selectAll("rect.subbar")
                .data(function (d) {
                    var vals = [];
                    for (var key in d.value.Groups) {
                        vals.push({ key: key, value: d.value.Groups[key].Value });
                    }
                    return vals;
                })
                .enter()
                .append("rect")
                .attr("class", "subbar")
                .attr("width", this.subX.rangeBand())
                .attr("x", function (d) { return self.subX(d.key); })
                .attr("y", function (d) { return self.y(d.value); })
                .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(d.value); })
                .attr("fill", function (d) { return self.color(d.key); })
                .on("mouseover", function (d, item) { self.mouseOver(self, this, d); })
                .on("mouseout", function (d, item) { self.mouseOut(self, this, d); });

        bars.append("svg:text")
            .text(function (d) { return self._tooltipFormat(self._valueAccessor(d)); })
            .attr("class", "tipValue");

        bars.append("svg:text")
            .text(function (d) { return self.tooltipLabel(); })
            .attr("class", "tipLabel");


        this.chart.append("g")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333")

        this.chart.append("g")
           .attr("transform", "translate(0," + (self.height() - self.margin().bottom - self.margin().top) + ")")
           .call(this.xAxis)
           .selectAll("text")
           .style("text-anchor", "end")
           .style("font-size", "12px")
           .style("fill", "#333")
           .attr("transform", function (d) { return "rotate(-90," + 0 + "," + 15 + ")"; })
           .on("click", function (filter) { return self.filterClick(this, filter); });


        var legend = this.chart.selectAll(".legend")
              .data(this._groupNames)
            .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", this.width() - this.margin().right / 2)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", this.color);

        legend.append("text")
            .attr("x", this.width() - this.margin().right / 2 - 10)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function (d) { return d; });

    }

    this.draw = function () {

        var self = this;

        var groups = this.chart.selectAll("g.group")
                        .data(this.dataset())

        groups.selectAll("rect.total")
            .transition().duration(self.duration)
            .attr("y", function (d) { return self.y(d.value.Total); })
            .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(d.value.Total); })

        groups.selectAll("rect.subbar")
                .data(function (d) {
                    var vals = [];
                    for (var key in d.value.Groups) {
                        vals.push({ key: key, value: d.value.Groups[key].Value });
                    }
                    return vals;
                })
                .transition().duration(self.duration)
                .attr("y", function (d) { return self.y(d.value); })
                .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(d.value); })

    }
}


GroupedBarChart.prototype = Object.create(BaseChart.prototype);
GroupedBarChart.prototype.constructor = GroupedBarChart;

