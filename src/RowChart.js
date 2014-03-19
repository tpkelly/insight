var RowChart = function RowChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.yAxis = d3.svg.axis()
        .scale(this.y).orient("left").tickSize(0).tickPadding(10);

    this.xAxis = d3.svg.axis()
        .scale(this.x).orient("bottom").tickSize(0).tickPadding(10).tickFormat(function(d) {
            return self.xFormatFunc(d);
        });

    this.initializeAxes = function() {
        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds().end]);

        this.y.domain(this.keys())
            .rangeRoundBands([0, this.height()], 0.2);
    };

    this.barXPosition = function(d) {
        var x = 0;
        if (self.invert()) {
            x = self.xBounds().end - self.x(self._valueAccessor(d));
        }
        return x;
    };

    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();

        var bars = this.chart.append("g")
            .selectAll("rect")
            .data(this.dataset())
            .enter().append("rect")
            .attr("x", this.barXPosition)
            .attr("y", function(d, i) {
                return self.y(d.key);
            })
            .attr("width", function(d) {
                return self.x(self._valueAccessor(d));
            })
            .attr("height", function(d) {
                return self.y.rangeBand();
            })
            .attr("fill", this.barColor())
            .on("click", function(filter) {
                self.filterClick(this, filter);
            })
            .on("mouseover", function(d, item) {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item) {
                self.mouseOut(self, this, d);
            });

        this.chart.selectAll("rect").data(this.dataset()).exit().remove();

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
            .attr("class", "y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px");
    };

    this.draw = function() {
        var self = this;

        if (self._redrawAxes) {

            this.y.domain(this.keys())
                .rangeRoundBands([0, this.height()], 0.2);

            this.yAxis = d3.svg.axis()
                .scale(this.y).orient("left").tickSize(0).tickPadding(10);

            this.chart
                .selectAll("g.y-axis")
                .transition().duration(self.duration)
                .call(this.yAxis).selectAll("text")
                .style("text-anchor", "end")
                .style("font-size", "12px")
                .style("fill", "#333");
        }

        var bars = self.chart.selectAll("rect")
            .data(this.dataset())
            .transition().duration(self.duration)
            .attr("width", function(d) {
                return self.x(self._valueAccessor(d));
            });

        if (self._redrawAxes) {
            bars.attr("y", function(d, i) {
                return self.y(d.key);
            })
                .attr("height", function(d) {
                    return self.y.rangeBand();
                });
        }

    };
    return this;
};


RowChart.prototype = Object.create(BaseChart.prototype);
RowChart.prototype.constructor = RowChart;
