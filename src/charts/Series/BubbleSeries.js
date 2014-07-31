/**
 * The BubbleSeries class extends the Series class
 * @class insight.BubbleSeries
 * @param {string} name - A uniquely identifying name for this chart
 * @param {DataSet} data - The DataSet containing this series' data
 * @param {insight.Scales.Scale} x - the x axis
 * @param {insight.Scales.Scale} y - the y axis
 * @param {object} color - a string or function that defines the color to be used for the items in this series
 */
insight.BubbleSeries = function BubbleSeries(name, data, x, y, color) {

    insight.Series.call(this, name, data, x, y, color);

    var self = this,
        selector = this.name + insight.Constants.Bubble,
        radiusFunction = d3.functor(10);

    this.classValues = [insight.Constants.Bubble];


    this.rangeY = function(d) {
        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i) {
        return self.x.scale(self.xFunction()(d));
    };

    /**
     * The function to extract the radius of each bubble from the data objects.
     * @memberof! insight.BubbleSeries
     * @instance
     * @returns {function} - The current function used to determine the radius of data objects.
     *
     * @also
     *
     * Sets the function to extract the radius of each bubble from the data objects.
     * @memberof! insight.BubbleSeries
     * @instance
     * @param {boolean} reversed The new function to extract the radius of each bubble from the data objects.
     * @returns {this}
     */
    this.radiusFunction = function(radiusFunc) {
        if (!arguments.length) {
            return radiusFunction;
        }
        radiusFunction = radiusFunc;

        return this;
    };

    /**
     * This method is called when any post aggregation calculations, provided by the computeFunction() setter, need to be recalculated.
     * @memberof insight.BubbleSeries
     * @instance
     * @param {insight.Scale} scale - a scale parameter to check if the values should be taken from x or y functions.
     * @returns {object} - the maximum value for the series on the provided axis
     */
    this.findMax = function(scale) {
        var self = this;

        var data = this.dataset();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        return d3.max(data, func);
    };


    this.bubbleData = function(data) {
        var max = d3.max(data, radiusFunction);

        var rad = function(d) {
            return d.radius;
        };

        //Minimum of pixels-per-axis-unit
        var xValues = data.map(self.xFunction());
        var yValues = data.map(self.yFunction());
        var xBounds = this.x.bounds[1];
        var yBounds = this.y.bounds[0];
        var maxRad = Math.min(xBounds / 10, yBounds / 10);

        // create radius for each item
        data.forEach(function(d) {
            var radiusInput = radiusFunction(d);

            if (radiusInput === 0)
                d.radius = 0;
            else
                d.radius = (radiusInput * maxRad) / max;
        });

        //this sort ensures that smaller bubbles are on top of larger ones, so that they are always selectable.  Without changing original array (hence concat which creates a copy)
        data = data.concat()
            .sort(function(a, b) {
                return d3.descending(rad(a), rad(b));
            });

        return data;
    };

    this.draw = function(chart, drag) {

        this.initializeTooltip(chart.container.node());
        this.selectedItems = chart.selectedItems;
        this.rootClassName = self.seriesClassName();

        var duration = drag ? 0 : function(d, i) {
            return 200 + (i * 20);
        };

        var click = function(filter) {
            return self.click(this, filter);
        };

        var bubbleData = this.bubbleData(this.dataset());

        var bubbles = chart.plotArea.selectAll('circle.' + insight.Constants.Bubble)
            .data(bubbleData, self.keyFunction());

        bubbles.enter()
            .append('circle')
            .attr('class', self.itemClassName)
            .on('mouseover', self.mouseOver)
            .on('mouseout', self.mouseOut)
            .on('click', click);


        var rad = function(d) {
            return d.radius;
        };

        bubbles.transition()
            .duration(duration)
            .attr('r', rad)
            .attr('cx', self.rangeX)
            .attr('cy', self.rangeY)
            .attr('opacity', 0.5)
            .attr('fill', this.color);
    };
};

insight.BubbleSeries.prototype = Object.create(insight.Series.prototype);
insight.BubbleSeries.prototype.constructor = insight.BubbleSeries;
