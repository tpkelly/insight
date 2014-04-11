var BarChart = function BarChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    var bars;

    this.init = function() {

        this.createChart();

        this._currentMax = this.findMax();

        this.initializeAxes();

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

        this.drawAxes();

        this.draw();

    };

    this.draw = function() {

        this.x.domain(this.keys())
            .rangeRoundBands([0, this.xDomain()], this.barPadding());

        if (self._redrawAxes) {
            this.y.domain([0, self.findMax()])
                .rangeRound([this.height() - this.margin()
                    .top - this.margin()
                    .bottom, 0
                ]);
        }

        this.drawRanges('behind');

        this.drawBars();

        this.drawRanges('front');

        this.drawTargets();

        this.updateAxes();

    };



    this.drawBars = function() {

        bars = self.chart.selectAll("rect")
            .data(this.dataset(), this.matcher);

        var newRows = bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("fill", this.calculateBarColor)
            .attr("x", this.xPosition)
            .attr("y", this.yDomain())
            .attr("height", 0)
            .on("mouseover", function(d) {
                self.mouseOver(self, this);
            })
            .on("mouseout", function(d) {
                self.mouseOut(self, this);
            });

        newRows.append("svg:text")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        newRows.append("svg:text")
            .text(this._tooltipLabel)
            .attr("class", "tipLabel");

        bars.transition()
            .duration(this.animationDuration)
            .attr("x", this.xPosition)
            .attr("y", this.yPosition)
            .attr("width", this.barWidth)
            .attr("height", this.barHeight);

        bars.selectAll("text.tipValue")
            .text(this.tooltipText);

    };

    this.drawAxes = function() {
        var self = this;

        this.chart.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis);

        this.chart.append("g")
            .attr("transform", "translate(0," + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ")")
            .attr("class", "x-axis");

    };


    this.updateAxes = function() {

        this.chart.selectAll("g.y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .attr('class', 'axis-text');

        var xaxis = this.chart.selectAll("g.x-axis")
            .call(this.xAxis);

        xaxis.selectAll("text")
            .style("text-anchor", "start")
            .attr("transform", "rotate(90)")
            .attr("dx", "10")
            .attr("dy", "0")
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter) {
                return self.filterClick(this, filter);
            });

        xaxis.selectAll("text:not(.selected)")
            .attr('class', 'axis-text');

    };

    this.drawTargets = function() {

        if (this._targets) {

            this._targetAccessor = this._targets.calculation;

            var targets = this.chart.selectAll("rect.target")
                .data(this.targetData(), this.matcher);

            var newTargets = targets
                .enter()
                .append("rect")
                .attr("class", "target " + this._targets.name + "class")
                .on("mouseover", function(d) {
                    self.mouseOver(self, this);
                })
                .on("mouseout", function(d) {
                    self.mouseOut(self, this);
                });

            newTargets.append("svg:text")
                .text(this.targetTooltipText)
                .attr("class", "tipValue");

            newTargets.append("svg:text")
                .text(this._targets.label)
                .attr("class", "tipLabel");

            targets
                .transition()
                .duration(this.animationDuration)
                .attr("x", this.targetX)
                .attr("y", this.targetY)
                .attr("width", this.targetWidth)
                .attr("height", 4)
                .attr("fill", this._targets.color);


            targets.selectAll("text.tipValue")
                .text(this.targetTooltipText)
                .attr("class", "tipValue");
        }
    };


    this.drawRanges = function(filter) {

        var ranges = filter ? this._ranges.filter(function(range) {
            return range.position == filter;
        }) : this._ranges;

        if (ranges) {
            for (var range in ranges) {

                this._rangeAccessor = ranges[range].calculation;

                var transform = ranges[range].type(this);

                var rangeIdentifier = "path." + ranges[range].class;

                var rangeElement = this.chart.selectAll(rangeIdentifier);

                if (!this.rangeExists(rangeElement)) {
                    this.chart.append("path")
                        .attr("class", ranges[range].class)
                        .attr("fill", ranges[range].color);
                }

                this.chart.selectAll(rangeIdentifier)
                    .datum(this.dataset(), this.matcher)
                    .transition()
                    .duration(this.animationDuration)
                    .attr("d", transform);
            }
        }
    };

    this.rangeExists = function(rangeSelector) {

        return rangeSelector[0].length;
    };

};


BarChart.prototype = Object.create(BaseChart.prototype);
BarChart.prototype.constructor = BarChart;
