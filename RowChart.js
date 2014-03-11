var RowChart = function RowChart(element, dimension, group) {

    BaseChart.call(this, element, dimension, group);

    var self = this;

    this._labelPadding = 10;
    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.maxValue = function () {
        var max = d3.max(this.group().all(), function (d) { return d.value; });
        return max;

    }

    this.initializeAxes = function () {
        this.x.domain([0, this.maxValue()])
                  .range([this.xBounds().start, this.xBounds().end]);

        this.y.domain(this.keys())
                  .rangeRoundBands([this.margin().top, this.height()], 0.2);
    }

    this.filterKey = function (d) {
        return d.key;
    }

    this.labelXPosition = function (label) {
        var x = self.labelPadding();

        if (self.invert()) {
            x = self.xBounds().end + self.labelPadding();
        }
        return x;
    }


    this.labelYPosition = function (d) {
        return self.y(d.key) + self.y.rangeBand() / 2;
    }


    this.barXPosition = function (d) {
        var x = self.xBounds().start;
        if (self.invert()) {
            x = self.xBounds().end - self.x(d.value);
        }
        return x;
    }
    
    this.init = function () {
        var self = this;

        this.createChart();
        this.initializeAxes();

        this.chart.append("g")
            .selectAll("rect")
            .data(this.dataset())
            .enter().append("rect")
                .attr("x", this.barXPosition)
                .attr("y", function (d, i) { return self.y(d.key); })
                .attr("width", function (d) { return self.x(d.value) - self.xBounds().start; })
                .attr("height", function (d) { return self.y.rangeBand(); })
                .attr("fill", this.barColor)
            .on("click", function (filter) { self.filterClick(this, filter); })
            .on("mouseover", function (d, item) { self.mouseOver(self, this, d); })
            .on("mouseout", function (d, item) { self.mouseOut(self, this, d); });


        this.chart.selectAll("text.label")
            .data(this.dataset())
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", this.labelXPosition)
            .attr("y", this.labelYPosition)
            .style("font-size", function () { return self.labelFontSize(); })
            .attr("fill", function () { return self.labelColor(); })
            .attr("text-anchor", function (d) { return this.labelAnchoring; })
            .text(function (d) { return d.key; });
    }

    this.draw = function () {
        var self = this;

        self.chart.selectAll("rect")
            .data(this.dataset())
            .transition().duration(self.duration)
            .attr("x", this.barXPosition)
            .attr("y", function (d, i) { return self.y(d.key); })
            .attr("width", function (d) { return self.x(d.value) - self.xBounds().start; })
            .attr("height", function (d) { return self.y.rangeBand(); });
    }
    return this;
}


RowChart.prototype = Object.create(BaseChart.prototype);
RowChart.prototype.constructor = RowChart;
