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

        self.measureTextWidth = function(text, font) {

            var measurer = insight.Utils.getDrawingContext(measureCanvas, font);
            var width = measurer.measureText(text).width;

            return width;

        };

        self.measureFontHeight = function(font) {

            var measurer = insight.Utils.getDrawingContext(measureCanvas, font);
            var height = measurer.measureText('aa').width;

            return height;

        };

    };

    /*
     * Factory method for testability
     */
    insight.TextMeasurer.create = function(canvas) {
        return new insight.TextMeasurer(canvas);
    };

})(insight);
