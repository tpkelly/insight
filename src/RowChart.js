var RowChart = function RowChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self.xFormatFunc(d);
        });

    this.initializeAxes = function() {
        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds()
                .end
            ]);

        this.y.domain(this.keys())
            .rangeRoundBands([0, this.yDomain()], 0.2);
    };

    this.rowWidth = function(d) {
        return this.x(this._valueAccessor(d));
    }.bind(this);

    this.yPosition = function(d) {
        return this.y(d.key);
    }.bind(this);

    this.rowHeight = function() {
        return this.y.rangeBand();
    }.bind(this);

    this.barXPosition = function(d) {
        var x = 0;
        if (this.invert()) {
            x = this.xBounds()
                .end - this.x(this._valueAccessor(d));
        }
        return x;
    }.bind(this);


    this.init = function() {
        var self = this;

        this.createChart();
        this.initializeAxes();

        var bars = this.chart.append("g")
            .selectAll("rect")
            .data(this.dataset())
            .enter()
            .append("rect")
            .attr("x", this.barXPosition)
            .attr("y", this.yPosition)
            .attr("width", this.rowWidth)
            .attr("height", this.rowHeight)
            .attr("fill", this.barColor())
            .on("mouseover", function(d, item) {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item) {
                self.mouseOut(self, this, d);
            });

        this.chart.selectAll("rect")
            .data(this.dataset())
            .exit()
            .remove();

        bars.append("svg:text")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        bars.append("svg:text")
            .text(this._tooltipLabel)
            .attr("class", "tipLabel");

        this.chart.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis)
            .selectAll("text")
            .attr('class', 'row-chart-y')
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter) {
                self.filterClick(this, filter);
            });
    };

    this.draw = function() {

        var self = this;

        if (self._redrawAxes) {

            this.y
                .domain(this.keys())
                .rangeRoundBands([0, this.height()], 0.2);

            this.x.domain([0, this.findMax()])
                .range([0, this.xBounds()
                    .end
                ]);

            this.chart
                .selectAll("g.y-axis")
                .call(this.yAxis)
                .selectAll("text")
                .each(function() {
                    d3.select(this)
                        .classed('row-chart-y', 'true');
                })
                .on("mouseover", this.setHover)
                .on("mouseout", this.removeHover)
                .on("click", function(filter) {
                    self.filterClick(this, filter);
                });
        }

        var bars = self.chart.selectAll("rect")
            .data(this.dataset())
            .transition()
            .duration(self.duration)
            .attr("width", this.rowWidth);

        bars.selectAll("text.tipValue")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        if (self._redrawAxes) {
            bars.attr("y", this.yPosition)
                .attr("height", this.rowHeight);
        }
    };
    return this;
};


RowChart.prototype = Object.create(BaseChart.prototype);
RowChart.prototype.constructor = RowChart;
