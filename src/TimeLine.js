function TimeLine(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.maxRange = d3.max(this.dataset(), function(d) {
        return d.value;
    });

    this.range = [this.dimension.Dimension.bottom(1)[0].Date, this.dimension.Dimension.top(1)[0].Date];

    this.brushColor = function(d) {
        if (!arguments.length) {
            return this._brushColor;
        }
        this._brushColor = d;
        return this;
    };

    this.initializeAxes = function() {

        this.x = d3.time.scale()
            .domain(this.range)
            .rangeRound([0, this.width()]);

        this.y = d3.scale.linear()
            .domain([0, this.maxRange])
            .rangeRound([this.yDomain(), 0]);

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .tickSize(0)
            .orient('bottom');
    };

    this.display = function() {

        var self = this;

        var minExtent = self.brush.extent()[0],
            maxExtent = self.brush.extent()[1];

        var func = {
            name: 'timeline',
            filterFunction: function(d) {
                return d >= minExtent && d <= maxExtent;
            }
        };


        if (String(minExtent) != String(maxExtent)) {
            // remove old filter if one exists
            if (this.oldFilter) {
                this.filterEvent(this.dimension, this.oldFilter);
            }

            this.filterEvent(this.dimension, func);

            this.oldFilter = func;

            self.mini.select('.brush')
                .call(self.brush.extent([minExtent, maxExtent]));
        } else {
            this.filterEvent(this.dimension, this.oldFilter);
        }

    };


    this.init = function() {

        this.createChart();
        this.initializeAxes();

        this.mini = this.chart.append('g')
            .attr('width', this.width())
            .attr('height', this.yDomain())
            .attr('class', 'mini');

        this.brush = d3.svg.brush()
            .x(this.x)
            .on('brush', function() {
                self.display();
            });


        //mini item rects
        self.mini.append('g')
            .selectAll('.miniItems')
            .data(this.dataset())
            .enter()
            .append('rect')
            .attr('class', 'minitems')
            .attr('x', this.xPosition)
            .attr('y', this.yPosition)
            .attr('width', 5)
            .attr('height', this.barHeight)
            .attr('fill', self._barColor);

        self.mini.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.yDomain() + ')')
            .style('font-size', '11px')
            .call(self.xAxis);

        self.mini.append('g')
            .attr('class', 'x brush')
            .call(self.brush)
            .selectAll('rect')
            .attr('height', this.yDomain())
            .attr('fill', self._brushColor)
            .style('opacity', '0.5');
    };


    this.draw = function() {
        var self = this;

        //mini item rects
        self.chart.selectAll('rect.minitems')
            .data(this.dataset())
            .transition()
            .duration(self.duration)
            .attr('y', this.yPosition)
            .attr('height', this.barHeight);

    };
}


TimeLine.prototype = Object.create(BaseChart.prototype);
TimeLine.prototype.constructor = TimeLine;
