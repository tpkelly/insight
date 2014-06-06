var RowChart = function RowChart(name, element, dimension, group)
{

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();




    this.initializeAxes = function()
    {
        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .orient(self.yOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.yAxisFormat());

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient(self.xOrientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.xAxisFormat());

        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds()
                .end
            ]);

        this.y.domain(this.keys())
            .rangeRoundBands([this.yBounds()
                .start, this.yBounds()
                .end
            ], self.barPadding());
    };

    this.rowWidth = function(d)
    {
        return this.x(this._valueAccessor(d));
    }.bind(this);

    this.yPosition = function(d)
    {
        return this.y(d.key);
    }.bind(this);

    this.rowHeight = function()
    {
        return this.y.rangeBand();
    }.bind(this);

    this.barXPosition = function(d)
    {
        var x = 0;
        if (this.invert())
        {
            x = this.xBounds()
                .end - this.x(this._valueAccessor(d));
        }
        return x;
    }.bind(this);


    this.init = function()
    {
        var self = this;

        this.createChart();
        this.initializeAxes();


        this.chart.append("g")
            .attr("class", InsightConstants.YAxisClass)
            .call(this.yAxis)
            .selectAll("text")
            .attr('class', InsightConstants.AxisTextClass)
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter)
            {
                self.filterClick(this, filter);
            });

        this.draw();
    };


    this.draw = function()
    {

        var self = this;

        this.y
            .domain(this.keys())
            .rangeRoundBands([0, this.height()], self.barPadding());

        var transY = this.invert() ? (this.width() - this.margin()
            .right) : 0;
        this.chart
            .selectAll("g." + InsightConstants.YAxisClass)
            .attr('transform', 'translate(' + transY + ',0)')
            .call(this.yAxis)
            .selectAll("text")
            .each(function()
            {
                d3.select(this)
                    .classed(InsightConstants.AxisTextClass, 'true');
            })
            .on("mouseover", this.setHover)
            .on("mouseout", this.removeHover)
            .on("click", function(filter)
            {
                self.filterClick(this, filter);
            });

        if (self._redrawAxes)
        {

            this.x.domain([0, this.findMax()])
                .range([0, this.xBounds()
                    .end
                ]);
        }

        var bars = this.chart.selectAll("rect")
            .data(this.dataset(), this.matcher);

        bars.exit()
            .remove();

        var newBars = bars.enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", this.yPosition)
            .attr("width", 0)
            .attr("fill", this.barColor())
            .attr("height", this.rowHeight)
            .on("mouseover", function(d, item)
            {
                self.mouseOver(self, this, d);
            })
            .on("mouseout", function(d, item)
            {
                self.mouseOut(self, this, d);
            });

        newBars.append("svg:text")
            .attr("class", "tipValue");

        newBars.append("svg:text")
            .attr("class", "tipLabel");

        var trans = bars.transition()
            .duration(this.animationDuration);

        trans.attr("x", this.barXPosition)
            .attr("width", this.rowWidth);

        bars.selectAll('text.tipValue')
            .text(this.tooltipText);

        bars.selectAll('text.tipLabel')
            .text(this.tooltipLabel());

        if (self._redrawAxes || self.orderable())
        {
            trans
                .attr("y", this.yPosition)
                .attr("height", this.rowHeight);
        }



    };

    return this;
};


RowChart.prototype = Object.create(BaseChart.prototype);
RowChart.prototype.constructor = RowChart;
