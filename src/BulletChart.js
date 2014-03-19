function BulletChart(name, element, dimension, group) {
    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.createChart = function() {
        this.chart = d3.select(this.element)
            .append("svg")
            .attr("fill", this.barColor)
            .style("width", this.width())
            .style("height", this.height());

        this.tooltip();

        this.chart = this.chart.append("g");

        this.tooltipAccessor = function(item) {
            return "Target: " + item.value.Targets + ", Actuals: " + item.value.Actuals;
        };
    };

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.xAxis = d3.svg.axis()
        .scale(this.x).orient("bottom").tickSize(0).tickPadding(10);


    this.labelAnchoring = function(d) {
        if (this.invert()) {
            return "start";
        } else {
            return "end";
        }
    };

    this.barXPosition = function(d) {

        var y = self.xBounds().start;

        var invert = self.invert();

        if (invert) {
            y = self.width() - self.x(d.value);
        }
        return y;
    };

    this.currentMax = 0;

    this.updateMax = function(d) {
        var dMax = d3.max([d.value.Actuals, d.value.Targets]);
        this.currentMax = dMax > this.currentMax ? dMax : this.currentMax;
        return this.currentMax;
    };

    this.findMax = function() {
        var max = d3.max(this.group().all(), function(d) {
            return self.updateMax(d);
        });

        return max;
    };

    this.initializeAxes = function() {
        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds().end]);

        this.y.domain(this.keys())
            .rangeRoundBands([0, this.height() - this.margin().top - this.margin().bottom], 0.2);
    };


    this.bulletHeight = function() {
        return 50;
    };

    this.init = function() {

        this.createChart();
        this.initializeAxes();

        var bars = this.chart.selectAll("g")
            .data(this.group().all())
            .enter().append("g")
            .attr("class", "bullet")
            .attr("transform", function(d) {
                return "translate(0, " + self.y(d.key) + ")";
            })
            .attr("width", this.width())
            .attr("height", this.bulletHeight());



        var bullets = bars.append("rect")
            .attr("class", "bulletbar")
            .attr("x", this.barXPosition)
            .attr("width", function(d) {
                return self.x(d.value.Actuals);
            })
            .attr("height", function(d) {
                return self.y.rangeBand();
            })
            .attr("fill", this.barColor)
            .on("click", function(filter) {
                return self.filterClick(this, filter);
            })
            .on("mouseover", function(d, item) {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item) {
                self.mouseOut(self, this, d);
            });

        var targets = bars.append("rect")
            .attr("class", "target")
            .attr("x", function(d) {
                return self.x(d.value.Targets) + self.xBounds().start;
            })
            .attr("width", 3)
            .attr("fill", "#34495e")
            .attr("height", function(d) {
                return self.y.rangeBand();
            });

        this.chart.append("g")
            .attr("transform", "translate(" + self.margin().left + "," + (self.height() - self.margin().bottom - self.margin().top) + ")")
            .call(this.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .style("font-size", function() {
                return self.labelFontSize();
            })
            .style("fill", "#333")
            .attr("transform", function(d) {
                return "rotate(-90," + 0 + "," + 15 + ")";
            });

        var labels = bars
            .append("text")
            .attr("x", this.labelXPosition)
            .attr("y", 30)
            .style("font-size", function() {
                return self.labelFontSize();
            })
            .attr("fill", function() {
                return self.labelColor();
            })
            .attr("text-anchor", function(d) {
                return this.labelAnchoring;
            })
            .text(function(d) {
                return d.key;
            });
    };

    this.draw = function() {

        var self = this;

        var bars = this.chart.selectAll("g")
            .data(this.group().all());

        var bullets = bars.selectAll("rect.bulletbar")
            .transition().duration(self.duration)
            .attr("width", function(d) {
                return self.x(d.value.Actuals);
            });

        var targets = bars.selectAll("rect.target")
            .transition().duration(self.duration)
            .attr("x", function(d) {
                return self.x(d.value.Targets) + self.xBounds().start;
            });

    };
}


BulletChart.prototype = Object.create(BaseChart.prototype);
BulletChart.prototype.constructor = BulletChart;
