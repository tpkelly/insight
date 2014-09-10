(function(insight) {

    /*
     * Measures the width and height of text using a given font.
     * @class insight.TextMeasurer
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

            var height = actualTextWidth * Math.abs(Math.sin(angleRadians)) + roughTextHeight * Math.abs(Math.cos(angleRadians));
            var width = actualTextWidth * Math.abs(Math.cos(angleRadians)) + roughTextHeight * Math.abs(Math.sin(angleRadians));

            // avoid rounding errors
            height = height.toFixed(10);
            width = width.toFixed(10);

            return {
                width: Math.ceil(width),
                height: Math.ceil(height)
            };

        };

    };

})(insight);
