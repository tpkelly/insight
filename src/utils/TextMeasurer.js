(function(insight) {

    /*
     * Measures the width and height of text using a given font.
     * @class insight.MarginMeasurer
     */
    insight.TextMeasurer = function TextMeasurer(canvas) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            measureCanvas = canvas;

        // Internal functions -------------------------------------------------------------------------------------------

        self.measureText = function(text, font, angleDegrees) {

            if (!angleDegrees) {
                angleDegrees = 0;
            }

            var measurer = insight.Utils.getDrawingContext(measureCanvas, font);
            var actualTextWidth = measurer.measureText(text).width;
            var roughTextHeight = measurer.measureText('aa').width;

            var angleRadians = insight.Utils.degreesToRadians(angleDegrees);

            var height = actualTextWidth * Math.sin(angleRadians) + roughTextHeight * Math.cos(angleRadians);
            var width = actualTextWidth * Math.cos(angleRadians) + roughTextHeight * Math.sin(angleRadians);

            // avoid rounding errors
            height = height.toFixed(10);
            width = width.toFixed(10);

            return {
                width: Math.ceil(width),
                height: Math.ceil(height)
            };

        };

    };

    /*
     * Factory method for testability
     */
    insight.TextMeasurer.create = function(canvas) {
        return new insight.TextMeasurer(canvas);
    };

})(insight);
