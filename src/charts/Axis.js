function Axis(chart, name, scale, anchor) {
    this.chart = chart;
    this.scale = scale;
    this.anchor = anchor ? anchor : 'left';
    this.name = name;

    var self = this;

    var tickSize = d3.functor(0);
    var tickPadding = d3.functor(10);
    var labelOrientation = d3.functor("lr");
    var orientation = scale.horizontal() ? d3.functor(this.anchor) : d3.functor(this.anchor);
    var textAnchor;

    if (scale.vertical()) {
        textAnchor = this.anchor == 'left' ? 'end' : 'start';
    }
    if (scale.horizontal()) {
        textAnchor = 'start';
    }

    var format = function(d) {
        return d;
    };

    this.chart.addAxis(this);

    this.format = function(_) {
        if (!arguments.length) {
            return format;
        }
        format = _;
        return this;
    };

    this.orientation = function(_) {
        if (!arguments.length) {
            return orientation();
        }
        orientation = d3.functor(_);
        return this;
    };

    this.tickSize = function(_) {
        if (!arguments.length) {
            return tickSize();
        }
        tickSize = d3.functor(_);
        return this;
    };

    this.tickPadding = function(_) {
        if (!arguments.length) {
            return tickPadding();
        }
        tickPadding = d3.functor(_);
        return this;
    };

    this.textAnchor = function(_) {
        if (!arguments.length) {
            return textAnchor;
        }
        textAnchor = _;
        return this;
    };

    this.labelOrientation = function(_) {
        if (!arguments.length) {
            return labelOrientation();
        }

        labelOrientation = d3.functor(_);

        return this;
    };

    this.tickRotation = function() {
        var offset = self.tickPadding() + (self.tickSize() * 2);

        var rotation = this.labelOrientation() == 'tb' ? 'rotate(90,0,' + offset + ')' : '';

        return rotation;
    };

    this.transform = function() {
        var transform = "translate(";

        if (self.scale.horizontal()) {
            transform += '0,' + (self.chart.height() - self.chart.margin()
                .bottom - self.chart.margin()
                .top) + ')';
        } else if (self.scale.vertical()) {
            var xShift = self.anchor == 'left' ? 0 : self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
            transform += xShift + ",0)";
        }

        return transform;
    };

    this.labelHorizontalPosition = function() {
        var pos = "";

        if (self.scale.horizontal()) {

        } else if (self.scale.vertical()) {

        }

        return pos;
    };

    this.labelVerticalPosition = function() {
        var pos = "";

        if (self.scale.horizontal()) {

        } else if (self.scale.vertical()) {

        }

        return pos;
    };

    this.positionLabels = function(labels) {

        if (self.scale.horizontal()) {
            labels.style('left', 0)
                .style('bottom', 0)
                .style('width', '100%')
                .style('text-align', 'center');
        } else if (self.scale.vertical()) {
            labels.style('left', '0')
                .style('top', '35%');
        }
    };

    this.initialize = function() {
        this.axis = d3.svg.axis()
            .scale(this.scale.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.format());

        this.chart.chart.append('g')
            .attr('class', self.name + ' ' + InsightConstants.AxisClass)
            .attr('transform', self.transform())
            .call(this.axis)
            .selectAll('text')
            .attr('class', self.name + ' ' + InsightConstants.AxisTextClass)
            .style('text-anchor', self.textAnchor())
            .style('transform', self.tickRotation());

        var labels = this.chart.container
            .append('div')
            .attr('class', self.name + InsightConstants.AxisLabelClass)
            .style('position', 'absolute')
            .text(self.scale.title);

        this.positionLabels(labels);

    };



    this.draw = function(dragging) {
        this.axis = d3.svg.axis()
            .scale(this.scale.scale)
            .orient(self.orientation())
            .tickSize(self.tickSize())
            .tickPadding(self.tickPadding())
            .tickFormat(self.format());

        var axis = this.chart.chart.selectAll('g.' + self.name + '.' + InsightConstants.AxisClass)
            .transition()
            .duration(500)
            .attr('transform', self.transform())
            .call(this.axis);

        axis
            .selectAll("text")
            .attr('transform', self.tickRotation())
            .style('text-anchor', self.textAnchor());

        d3.select(this.chart.element)
            .select('div.' + self.name + InsightConstants.AxisLabelClass)
            .text(self.scale.title);
    };
}
