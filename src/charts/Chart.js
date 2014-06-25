function Chart(name, element, dimension) {

    this.name = name;
    this.element = element;
    this.dimension = dimension;
    this.selectedItems = [];

    var height = d3.functor(300);
    var width = d3.functor(300);
    var zoomable = false;
    var zoomScale = null;
    this.container = null;

    this.chart = null;

    this.measureCanvas = document.createElement("canvas");

    this._margin = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };

    var series = [];
    var scales = [];
    var axes = [];
    var self = this;
    var barPadding = d3.functor(0.1);
    var title = "";
    var autoMargin = false;


    this.addAxis = function(axis) {
        axes.push(axis);
    };

    this.axes = function() {
        return axes;
    };

    this.addClipPath = function() {
        this.chart.append("clipPath")
            .attr("id", this.clipPath())
            .append("rect")
            .attr("x", 1)
            .attr("y", 0)
            .attr("width", this.width() - this.margin()
                .left - this.margin()
                .right)
            .attr("height", this.height() - this.margin()
                .top - this.margin()
                .bottom);
    };

    this.init = function(create, container) {

        if (autoMargin) {
            this.calculateLabelMargin();
        }

        this.container = create ? d3.select(container)
            .append('div') : d3.select(this.element)
            .append('div');

        this.container
            .attr('class', InsightConstants.ContainerClass)
            .style('width', this.width() + 'px')
            .style('position', 'relative')
            .style('display', 'inline-block');

        this.chartSVG = this.container
            .append("svg")
            .attr("class", InsightConstants.ChartSVG)
            .attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chartSVG.append("g")
            .attr('class', InsightConstants.Chart)
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");

        this.addClipPath();

        scales.map(function(scale) {
            scale.initialize();
        });

        axes.map(function(axis) {
            axis.initialize();
            var a = axis.scale.domain();
        });

        if (zoomable) {
            this.initZoom();
        }

        this.tooltip();

        this.draw(false);
    };

    this.resizeChart = function() {
        this.container.style('width', this.width() + "px");

        this.chartSVG
            .attr("width", this.width())
            .attr("height", this.height());

        this.chart = this.chart
            .attr("transform", "translate(" + this.margin()
                .left + "," + this.margin()
                .top + ")");

        this.chart.select("#" + this.clipPath())
            .append("rect")
            .attr("x", 1)
            .attr("y", 0)
            .attr("width", this.width() - this.margin()
                .left - this.margin()
                .right)
            .attr("height", this.height() - this.margin()
                .top - this.margin()
                .bottom);
    };

    this.draw = function(dragging) {
        this.resizeChart();

        this.recalculateScales();

        axes.map(function(axis) {
            axis.draw(dragging);
        });

        this.series()
            .map(function(series) {
                series.draw(dragging);
            });
    };

    this.recalculateScales = function() {
        scales.map(function(scale) {
            var zx = zoomScale != scale;
            if (zx) {
                scale.initialize();
            }
        });
    };

    this.zoomable = function(scale) {
        zoomable = true;
        zoomScale = scale;
        return this;
    };

    this.initZoom = function() {
        this.zoom = d3.behavior.zoom()
            .on("zoom", self.dragging.bind(self));

        this.zoom.x(zoomScale.scale);

        if (!this.zoomExists()) {
            this.chart.append("rect")
                .attr("class", "zoompane")
                .attr("width", this.width())
                .attr("height", this.height() - this.margin()
                    .top - this.margin()
                    .bottom)
                .style("fill", "none")
                .style("pointer-events", "all");
        }

        this.chart.select('.zoompane')
            .call(this.zoom);
    };

    this.zoomExists = function() {
        var z = this.chart.selectAll('.zoompane');
        return z[0].length;
    };

    this.dragging = function() {
        self.draw(true);
    };

    this.barPadding = function(_) {
        if (!arguments.length) {
            return barPadding();
        }
        barPadding = d3.functor(_);
        return this;
    };

    this.margin = function(_) {
        if (!arguments.length) {
            return this._margin;
        }
        this._margin = _;
        return this;
    };

    this.clipPath = function() {

        return this.name.split(' ')
            .join('_') + "clip";
    };




    this.tooltip = function() {

        this.tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<span class='tipvalue'>" + d + "</span>";
            });

        this.chart.call(this.tip);

        return this;
    };

    this.mouseOver = function(chart, item, d) {

        var tooltip = $(item)
            .find('.tooltip')
            .first()
            .text();

        this.tip.show(tooltip);

        d3.select(item)
            .classed("active", true);
    };

    this.mouseOut = function(chart, item, d) {
        this.tip.hide(d);

        d3.select(item)
            .classed("active", false);
    };

    this.title = function(_) {
        if (!arguments.length) {
            return title;
        }

        title = _;
        return this;
    };

    this.width = function(_) {
        if (!arguments.length) {
            return width();
        }

        width = d3.functor(_);
        return this;
    };

    this.height = function(_) {
        if (!arguments.length) {
            return height();
        }
        height = d3.functor(_);
        return this;
    };

    this.series = function(_) {
        if (!arguments.length) {
            return series;
        }
        series = _;
    };


    this.scales = function(_) {
        if (!arguments.length) {
            return scales;
        }
        scales = _;
    };


    this.addHorizontalScale = function(type, typeString, direction) {
        var scale = new Scale(this, type, direction, typeString);
    };


    this.addHorizontalAxis = function(scale) {
        var axis = new Axis(this, scale, 'h', 'left');
    };


    this.autoMargin = function(_) {
        if (!arguments.length) {
            return autoMargin;
        }
        autoMargin = _;
        return this;
    };


    this.highlight = function(selector, value) {


        var clicked = this.chart.selectAll("." + selector);
        var alreadySelected = clicked.classed('selected');

        if (alreadySelected) {
            clicked.classed('selected', false);
            InsightUtils.removeItemFromArray(self.selectedItems, selector);
        } else {
            clicked.classed('selected', true)
                .classed('notselected', false);
            self.selectedItems.push(selector);
        }

        var selected = this.chart.selectAll('.selected');
        var notselected = this.chart.selectAll('.bar:not(.selected),.bubble:not(.selected)');

        notselected.classed('notselected', selected[0].length > 0);
    };
}



Chart.prototype.calculateLabelMargin = function() {

    var canvas = this.measureCanvas;
    var max = 0;

    this.series()
        .forEach(function(series) {
            var m = series.maxLabelDimensions(canvas);
            max = m > max ? m : max;
        });

    this.margin()
        .bottom = max;
};


// Helper functions for adding series without having to create the scales & axes yourself (move to builder class?)

Chart.prototype.addColumnSeries = function(series) {

    var x = new Scale(this, "", d3.scale.ordinal(), 'h', 'ordinal');
    var y = new Scale(this, "", d3.scale.linear(), 'v', 'linear');

    var stacked = series.stacked ? true : false;

    var s = new ColumnSeries(series.name, this, series.data, x, y, series.color)
        .stacked(stacked);

    s.series = [series];

    this.series()
        .push(s);

    return s;
};


Chart.prototype.addLineSeries = function(series) {

    var x = new Scale(this, "", d3.scale.ordinal(), 'h', 'ordinal');
    var y = new Scale(this, "", d3.scale.linear(), 'v', 'linear');

    var s = new LineSeries(series.name, this, series.data, x, y, series.color)
        .yFunction(series.accessor);

    this.series()
        .push(s);

    return s;
};
