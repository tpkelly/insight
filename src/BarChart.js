function BarChart(name, element, dimension, group) {

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
