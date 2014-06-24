function Series(name, chart, data, x, y, color) {

    this.chart = chart;
    this.data = data;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = d3.functor(color);
    this.animationDuration = 300;
    this.topValues = null;
    this.selectedItems = [];
    this.dimensionName = data.dimension ? data.dimension.Name + "Dim" : "";
    x.addSeries(this);
    y.addSeries(this);

    if (data.registerSeries) {
        data.registerSeries(this);
    }

    var self = this;
    var cssClass = "";

    var filter = null;

    // private functions used internally, set by functions below that are exposed on the object

    var xFunction = function(d) {
        return d.key;
    };

    var yFunction = function(d) {
        return d.value;
    };

    var tooltipFormat = function(d) {
        return d;
    };

    var tooltipAccessor = function(d) {
        return yFunction(d);
    };

    var tooltipFunction = function(d) {
        return tooltipFormat(tooltipAccessor(d));
    };

    this.dataset = function() {
        //won't always be x that determines this (rowcharts, bullets etc.), need concept of ordering by data scale?

        var data = this.x.ordered() ? this.data.getOrderedData(this.topValues) : this.data.getData();

        if (filter) {
            data = data.filter(filter);
        }

        return data;
    };

    this.keys = function() {
        return this.dataset()
            .map(xFunction);
    };

    this.cssClass = function(_) {
        if (!arguments.length) {
            return cssClass;
        }
        cssClass = _;
        return this;
    };

    this.keyAccessor = function(d) {
        return d.key;
    };

    this.xFunction = function(_) {
        if (!arguments.length) {
            return xFunction;
        }
        xFunction = _;

        return this;
    };

    this.yFunction = function(_) {
        if (!arguments.length) {
            return yFunction;
        }

        yFunction = _;

        return this;
    };

    this.sliceSelector = function(d) {

        var result = d.key.replace ? "in_" + d.key.replace(/[^A-Z0-9]/ig, "_") : "";

        return result;
    };


    this.selectedClassName = function(name) {
        var selected = "";

        if (self.selectedItems.length) {
            selected = self.selectedItems.indexOf(name) > -1 ? "selected" : "notselected";
        }

        return selected;
    };

    this.highlight = function(selector, value) {
        var clicked = this.chart.chart.selectAll("." + selector);
        var alreadySelected = clicked.classed('selected');

        if (alreadySelected) {
            clicked.classed('selected', false);
            InsightUtils.removeItemFromArray(self.selectedItems, selector);
        } else {
            clicked.classed('selected', true)
                .classed('notselected', false);
            self.selectedItems.push(selector);
        }

        var selected = this.chart.chart.selectAll('.selected');
        var notselected = this.chart.chart.selectAll('.bar:not(.selected),.bubble:not(.selected)');

        notselected.classed('notselected', selected[0].length > 0);
    };



    this.click = function(element, filter) {

        var selector = self.sliceSelector(filter);

        this.clickEvent(this, filter, selector);
    };

    this.filterFunction = function(_) {
        if (!arguments.length) {
            return filter;
        }
        filter = _;

        return this;
    };

    this.tooltipFormat = function(_) {
        if (!arguments.length) {
            return tooltipFormat;
        }
        tooltipFormat = _;

        return this;
    };

    this.tooltipFunction = function(_) {
        if (!arguments.length) {
            return tooltipFunction;
        }
        tooltipFunction = _;

        return this;
    };

    this.top = function(_) {
        if (!arguments.length) {
            return this.topValues;
        }
        this.topValues = _;

        return this;
    };

    this.maxLabelDimensions = function(measureCanvas) {

        var sampleText = document.createElement('div');
        sampleText.setAttribute('class', InsightConstants.AxisTextClass);
        var style = window.getComputedStyle(sampleText);
        var ctx = measureCanvas.getContext('2d');
        ctx.font = style['font-size'] + ' ' + style['font-family'];

        var max = 0;

        this.keys()
            .forEach(function(key) {

                var width = ctx.measureText(key)
                    .width;

                max = width > max ? width : max;
            });

        return max;
    };


    this.findMax = function(scale) {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };

    this.draw = function() {};

    return this;
}

/* Skeleton event overriden by a Dashboard to subscribe to this series' clicks.
 * @param {object} series - The series being clicked
 * @param {object[]} filter - The value of the point selected, used for filtering/highlighting
 * @param {object[]} selection - The css selection name also used to maintain a list of filtered dimensions (TODO - is this needed anymore?)
 */
Series.prototype.clickEvent = function(series, filter, selection) {

};
