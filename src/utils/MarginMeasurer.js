(function(insight) {

    /*
     * Calculates margins for Charts, given axes and series with datasets.
     * @class insight.MarginMeasurer
     */
    insight.MarginMeasurer = function MarginMeasurer() {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            labelPadding = 10;

        // Internal functions -------------------------------------------------------------------------------------------

        /*
         * Calculates the dimensions required for a single series' margin entries
         * @memberof! insight.MarginMeasurer
         * @instance
         * @param {insight.Series} series - A Series to measure
         * @param {Number} lineHeight - The CSS line-height to use when defining dimensions
         * @param {object} axisContext - A 2d canvas drawing context to measure axis value text with
         * @param {object} labelContext - A 2d canvas drawing context to measure label text with
         * @param {object} labelStyles - An associative map {cssName: value} of styles to apply when measuring axis labels(font-size, font-family etc.)
         * @returns {object} - margin object {top: Number,left: Number,bottom:Number,right:Number}
         */
        self.seriesLabelDimensions = function(series, lineHeight, axisContext, labelContext) {

            var maxValueWidth = 0,
                maxKeyWidth = 0,
                maxFontHeight = 0,
                keyLabelHeight = 0,
                valueLabelHeight = 0,
                keyAxis = series.keyAxis,
                valueAxis = series.valueAxis,
                data = series.dataset(),
                keys = series.keys(),
                x = series.x,
                y = series.y,
                displayKey = keyAxis.shouldDisplay(),
                displayValue = valueAxis.shouldDisplay(),
                formatFunction,
                valueString,
                keyDimensions,
                valueDimensions,
                value;

            // loop through keys and values to measure lengths
            keys.forEach(function(key) {
                if (displayKey) {
                    formatFunction = x === keyAxis ? x.tickLabelFormat() : y.tickLabelFormat();
                    valueString = formatFunction(key);
                    keyDimensions = axisContext.measureText(valueString);
                    maxKeyWidth = Math.max(keyDimensions.width, maxKeyWidth);
                }
                if (displayValue) {

                    value = insight.Utils.valueForKey(data, key, series.keyFunction(), series.valueFunction());
                    formatFunction = y === valueAxis ? y.tickLabelFormat() : x.tickLabelFormat();
                    valueString = formatFunction(value);
                    valueDimensions = axisContext.measureText(valueString);
                    maxValueWidth = Math.max(valueDimensions.width, maxValueWidth);
                }
            });

            // If there was some data, append Axis labels and padding to the max values
            if (keys.length) {

                if (displayKey) {
                    var keyAxisPadding = keyAxis.tickPadding() + keyAxis.tickSize();
                    var keyAxisLabelWidth = labelContext.measureText(keyAxis.label())
                        .width;
                    var axisLabelAdditions = keyAxisPadding + keyAxisLabelWidth + labelPadding;

                    maxKeyWidth = maxKeyWidth + axisLabelAdditions;
                    keyLabelHeight = lineHeight;
                }
                if (displayValue) {
                    var valueAxisPadding = valueAxis.tickPadding() + valueAxis.tickSize();
                    var valueAxisLabelWidth = labelContext.measureText(valueAxis.label())
                        .width;
                    var valueLabelAdditions = valueAxisPadding + valueAxisLabelWidth + labelPadding;

                    maxValueWidth = valueAxis.shouldDisplay() ? maxValueWidth + valueLabelAdditions : maxValueWidth;
                    valueLabelHeight = lineHeight;
                }
            }

            var maxDimensions = {
                "maxKeyWidth": maxKeyWidth,
                "maxKeyHeight": keyLabelHeight,
                "maxValueWidth": maxValueWidth,
                "maxValueHeight": valueLabelHeight
            };

            //Handle tick rotation
            if (keyAxis.tickLabelRotation() !== '0') {
                //Convert Degrees -> Radians
                var xSin = Math.sin(keyAxis.tickLabelRotation() * Math.PI / 180);
                var xCos = Math.cos(keyAxis.tickLabelRotation() * Math.PI / 180);

                maxDimensions.maxKeyWidth = Math.ceil(Math.max(lineHeight * xSin, maxKeyWidth * xCos));
                maxDimensions.maxKeyHeight = Math.ceil(Math.max(lineHeight * xCos, maxKeyWidth * xSin));
            }

            if (valueAxis.tickLabelRotation() !== '0') {
                //Convert Degrees -> Radians
                var ySin = Math.sin(valueAxis.tickLabelRotation() * Math.PI / 180);
                var yCos = Math.cos(valueAxis.tickLabelRotation() * Math.PI / 180);

                maxDimensions.maxValueWidth = Math.ceil(Math.max(lineHeight * ySin, maxValueWidth * yCos));
                maxDimensions.maxValueHeight = Math.ceil(Math.max(lineHeight * yCos, maxValueWidth * ySin));
            }

            return maxDimensions;
        };

        /*
         * Calculates a margin object {top,left,bottom,right} for a chart given a list of series and associated CSS styles
         * @memberof! insight.MarginMeasurer
         * @instance
         * @param {insight.Series[]} seriesArray - An array of Series to calculate dimensions from
         * @param {DOMElement} measuringCanvas - A canvas element to measure text with
         * @param {object} axisStyles - An associative map {cssName: value} of styles to apply when measuring axis values (font-size, font-family etc.)
         * @param {object} labelStyles - An associative map {cssName: value} of styles to apply when measuring axis labels(font-size, font-family etc.)
         * @returns {object} - margin object {top: Number,left: Number,bottom:Number,right:Number}
         */
        self.calculateChartMargins = function(seriesArray, measuringCanvas, axisStyles, labelStyles) {

            labelStyles = labelStyles ? labelStyles : axisStyles;

            var margin = {
                "top": 0,
                "left": 0,
                "bottom": 0,
                "right": 0
            };

            var axisMeasuringContext = insight.Utils.getDrawingContext(measuringCanvas, axisStyles);
            var labelMeasuringContext = insight.Utils.getDrawingContext(measuringCanvas, labelStyles);

            var lineHeightString = axisStyles['line-height'];

            if (!lineHeightString) {
                return margin;
            }

            // remove 'px' from end
            var lineHeight = insight.Utils.tryParseInt(lineHeightString.slice(0, lineHeightString.length - 2), 16);

            seriesArray.forEach(function(series) {
                var keyAxis = series.keyAxis;
                var valueAxis = series.valueAxis;

                var labelDimensions = self.seriesLabelDimensions(series, lineHeight, axisMeasuringContext, labelMeasuringContext);

                var keyProperty = keyAxis.isHorizontal() ? 'maxKeyHeight' : 'maxKeyWidth';
                var valueProperty = valueAxis.isHorizontal() ? 'maxValueHeight' : 'maxValueWidth';

                margin[keyAxis.orientation()] = Math.max(labelDimensions[keyProperty], margin[keyAxis.orientation()]);
                margin[valueAxis.orientation()] = Math.max(labelDimensions[valueProperty], margin[valueAxis.orientation()]);
            });

            return margin;
        };

    };

})(insight);
