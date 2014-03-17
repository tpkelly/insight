function StackedBarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.ordinal();
    this.y = d3.scale.linear();

    this.xFormatFunc = function (d) {
        return d;
    }    

    this.yAxis = d3.svg.axis()
					  .scale(this.y).orient("left").tickSize(0).tickPadding(10);

    this.xAxis = d3.svg.axis()
                      .scale(this.x).orient("bottom").tickSize(0).tickPadding(10).tickFormat(function (d) { return self.xFormatFunc(d); });

    this.xAxisFormat = function (f) {
        this.xFormatFunc = f;
        return this;
    }

    this.addSeries = function (f)
    {
        this.series = f;
        return this;
    }
    
    this.labelAnchoring = function (d) {
        if (this.invert()) {
            return "start";
        }
        else { return "end"; }
    };

    this.initializeAxes = function () {
        this.x.domain(this.keys())
                .rangeRoundBands([0, this.width() - this.margin().left - this.margin().right], 0.2);

        this.y.domain([0, this.findMax()])
                .range([this.height() - this.margin().top - this.margin().bottom, 0]);
    }

    this.filterKey = function (d) {
        return d.key;
    }

    
    this.calculateYPos = function (func,d)
    {
        if (!d.yPos)
        {
            d.yPos = 0;
        }
        d.yPos += func(d);

        return d.yPos;
    };

    this.init = function () {
        var self = this;

        this.createChart();
        this.initializeAxes();

        var groups = this.chart.selectAll("g")
            .data(this.dataset());

        
        groups.enter().append("g").attr("class", "bargroup")

        var bars = groups.selectAll('rect.bar');
        

        for (seriesFunction in this.series) {
            var func = this.cumulative() ? self.series[seriesFunction].cumulative : self.series[seriesFunction].calculation;
            
            bars = groups.append("rect")
                        .attr("class", self.series[seriesFunction].name + "class bar")
                        .attr("x", function (d, i) { return self.x(self._keyAccessor(d)); })
                        .attr("y", function (d, i) { return self.y(self.calculateYPos(func, d)); })
                        .attr("width", function (d) { return self.x.rangeBand(); })
                        .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(func(d)); })
                        .attr("fill", self.series[seriesFunction].color)
                        .on("mouseover", function (d, item) { self.mouseOver(self, this, d); })
                        .on("mouseout", function (d, item) { self.mouseOut(self, this, d); });



            bars.append("svg:text")
                .text(function (d) { return self._tooltipFormat(func(d)); })
                .attr("class", "tipValue");

            bars.append("svg:text")
                .text(function (d) { return self.series[seriesFunction].label; })
                .attr("class", "tipLabel");
        }
        
        this.chart.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333")

        this.chart.append("g")
           .attr("transform", "translate(0," + (self.height() - self.margin().bottom - self.margin().top) + ")")
           .call(this.xAxis)
           .selectAll("text")
            .attr("class", "x-axis")
           .style("text-anchor", "end")
           .style("font-size", "12px")
           .attr("transform", function (d) { return "rotate(-90," + 0 + "," + 15 + ")"; })
           .on("mouseover", function (d, item) { self.setHover(this); })
           .on("mouseout", function (d, item) { self.removeHover(this); })
           .on("click", function (filter) { return self.filterClick(this, filter); });

        if (this._targets.length) {
            for (target in this._targets) {
                var func = this.cumulative() ? self._targets[target].cumulative : self._targets[target].calculation;

                var tBars = groups.append("rect")
                                    .attr("class", self._targets[target].name + "class target")
                                    .attr("x", function (d, i) { return self.x(self._keyAccessor(d))+self.x.rangeBand()/4; })
                                    .attr("y", function (d, i) { return self.y(func(d)); })
                                    .attr("width", function (d) { return self.x.rangeBand()/2; })
                                    .attr("height", 4)
                                    .attr("fill", self._targets[target].color)
                                    .on("mouseover", function (d, item) { self.mouseOver(self, this, d); })
                                    .on("mouseout", function (d, item) { self.mouseOut(self, this, d); });

                tBars.append("svg:text")
                    .text(function (d) { return self._tooltipFormat(func(d)); })
                    .attr("class", "tipValue");

                tBars.append("svg:text")
                    .text(function (d) { return self._targets[target].label; })
                    .attr("class", "tipLabel");
            }
        }
    }


    this.draw = function () {
        
        var self = this;

        if (self.redrawAxes()) {
            this.y.domain([0, self.findMax()]).range([this.height() - this.margin().top - this.margin().bottom, 0]);
        }
        

        var groups = this.chart.selectAll("g.bargroup")
            .data(this.dataset())
            .each(function (d, i) { d.yPos = 0; });
        

        for (seriesFunction in this.series) {

            var func = this.cumulative() ? self.series[seriesFunction].cumulative : self.series[seriesFunction].calculation;

            var bars = groups.selectAll("." + self.series[seriesFunction].name + "class.bar")
                        .transition().duration(self.duration)
                        .attr("val", function (d) { return func(d); })
                        .attr("x", function (d, i) { return self.x(self._keyAccessor(d)); })
                        .attr("y", function (d, i) { return self.y(self.calculateYPos(func, d)); })
                        .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(func(d)); });


            bars.selectAll("text.tipValue")
                .text(function (d) { return self._tooltipFormat(func(d)); })

            bars.selectAll("text.tipLabel")
                .text(function (d) { return self.series[seriesFunction].label; })

        }

        if (this._targets.length) {

            for (target in this._targets) {
                var func = this.cumulative() ? self._targets[target].cumulative : self._targets[target].calculation;

                var tBars = groups.selectAll("." + self._targets[target].name + "class.target")
                                    .transition().duration(self.duration)
                                    .attr("y", function (d, i) { return self.y(func(d)); })

                tBars.selectAll("text.tipValue")
                    .text(function (d) { return self._tooltipFormat(func(d)); })
                    .attr("class", "tipValue");

                tBars.selectAll("text.tipLabel")
                    .text(function (d) { return self._targets[target].label; })
                    .attr("class", "tipLabel");
            }
        }

        this.chart.selectAll(".y-axis").call(this.yAxis).selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333")
    }
}


StackedBarChart.prototype = Object.create(BaseChart.prototype);
StackedBarChart.prototype.constructor = StackedBarChart;
