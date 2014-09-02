(function(insight) {

    /*
     * Measures the width and height of text using a given font.
     * @class insight.MarginMeasurer
     */
    insight.TextMeasurer = function TextMeasurer(canvas) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this,
            measureCanvas = canvas;

        // Private functions

        function degreesToRadians(angle) {

            return angle * (Math.PI / 180);

        }

        // Internal functions -------------------------------------------------------------------------------------------

        self.measureText = function(text, font, angleDegrees) {

            if (!angleDegrees) {
                angleDegrees = 0;
            }

            var width, height, angleRadians;

            var measurer = insight.Utils.getDrawingContext(measureCanvas, font);
            var horizontalWidth = measurer.measureText(text).width;
            var horizontalHeight = measurer.measureText("aa").width;

            angleRadians = degreesToRadians(angleDegrees);

            height = horizontalWidth * Math.sin(angleRadians) + horizontalHeight * Math.cos(angleRadians);
            width = horizontalWidth * Math.cos(angleRadians) + horizontalHeight * Math.sin(angleRadians);

            return {
                width: width,
                height: height
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
