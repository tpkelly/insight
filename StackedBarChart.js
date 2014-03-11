function StackedBarChart(element, dimension, group) {

    BaseChart.call(this, element, dimension, group);

    var self = this;

    this.series = [{ name: 'current', calculation: function (d) { return self._valueAccessor(d); }, color: this._barColor}];

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
        this.series.push(f);
        return this;
    }

    this.labelAnchoring = function (d) {
        if (this.invert()) {
            return "start";
        }
        else { return "end"; }
    };


    this.currentMax = 0;

    this.updateMax = function (d) {
        var value = 0;
        for (seriesFunction in this.series)
        {
            value += this.series[seriesFunction].calculation(d);
            this.currentMax = value > this.currentMax ? value : this.currentMax;
        }
        
        return this.currentMax;
    }

    this.findMax = function () {
        var max = d3.max(this.dataset(), function (d) {
            return self.updateMax(d);
        });

        return max;
    }


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

        for (seriesFunction in this.series) {

            groups.append("rect")
                    .attr("class", self.series[seriesFunction].name + "class")
                    .attr("x", function (d, i) { return self.x(self._keyAccessor(d)); })
                    .attr("y", function (d, i) { return self.y(self.calculateYPos(self.series[seriesFunction].calculation, d)); })
                    .attr("width", function (d) { return self.x.rangeBand(); })
                    .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(self.series[seriesFunction].calculation(d)); })
                    .attr("fill", self.series[seriesFunction].color)
                    .on("mouseover", function (d, item) { self.mouseOver(self, this, d); })
                    .on("mouseout", function (d, item) { self.mouseOut(self, this, d); });
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
           .style("fill", "#333")
           .attr("transform", function (d) { return "rotate(-90," + 0 + "," + 15 + ")"; });
        
    }

    this.draw = function () {
        
        var self = this;

        if (self._redrawAxes) {
            this.y.domain([0, self.findMax()]).range([this.height() - this.margin().top - this.margin().bottom, 0]);
        }
        console.log(this.dataset());

        var groups = this.chart.selectAll("g.bargroup")
            .data(this.dataset())
            .each(function (d, i) {
                d.yPos = 0;
            });

        for (seriesFunction in this.series) {

            groups.selectAll("." + self.series[seriesFunction].name + "class")
                
                .transition().duration(self.duration)
                .attr("x", function (d, i) { return self.x(self._keyAccessor(d)); })
                .attr("y", function (d, i) { return self.y(self.calculateYPos(self.series[seriesFunction].calculation, d)); })
                .attr("height", function (d) { return (self.height() - self.margin().top - self.margin().bottom) - self.y(self.series[seriesFunction].calculation(d)); });
        }

        this.chart.selectAll("g.y-axis").call(this.yAxis).selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", "12px")
            .style("fill", "#333")
    }
}


StackedBarChart.prototype = Object.create(BaseChart.prototype);
StackedBarChart.prototype.constructor = StackedBarChart;
