/**
 * The Tooltip class
 * @class insight.Chart
 * @param {string} name - A uniquely identifying name for this chart
 * @param {string} element - The css selector identifying the div container that the chart will be drawn in. '#columnChart' for example.
 */
insight.Tooltip = (function(insight) {

    function Tooltip() {

        // Local private variables
        var className = insight.Constants.Tooltip,
            self = this,
            chartContainer = null,
            styles = {},
            offset = {
                x: 0,
                y: 0
            },
            baseStyles = {
                'position': 'absolute',
                'opacity': '0',
                'top': '0',
                'pointer-events': 'none',
                'box-sizing': 'border-box'
            };

        // Private methods


        function createElement() {

            var element = d3.select(self.container())
                .append('div');

            element.attr('class', className)
                .style(self.styles());

            self.element = element.node();
        }


        function setTooltipContent(content) {
            d3.select(self.element)
                .html(content);
        }


        function getTooltipPosition(target) {

            var boundingBox = insight.Utils.getSVGBoundingBox(target);

            var offset = self.offset();

            var y = boundingBox.n.y - self.element.offsetHeight;
            var x = boundingBox.n.x - self.element.offsetWidth / 2;

            y = y + offset.y;
            x = x + offset.x;

            return {
                x: x,
                y: y
            };
        }


        function drawTooltip(position) {

            d3.select(self.element)
                .style({
                    'opacity': '1',
                    'top': position.y + "px",
                    'left': position.x + "px"
                });
        }

        // Public Methods

        /**
         * This method gets or sets the offset amounts for the tooltip, in an offset object {x, y}.
         * @memberof insight.Tooltip
         * @returns {object} offset - An offset object with x and y values for offsetting the position of the tooltip.
         */
        /**
         * @memberof insight.Tooltip
         * @returns {object} return - The tooltip object
         * @param {object} offset - An offset object with x and y values for offsetting the position of the tooltip.
         */
        this.offset = function(value) {
            if (!arguments.length) {
                return offset;
            }

            offset = value;
            return this;
        };


        /**
         * This method gets or sets any styles for the tooltip, in standard {'name': 'value', ...} format.
         * @memberof insight.Tooltip
         * @returns {object} styles - A dictionary object of CSS property names and values
         */
        /**
         * @memberof insight.Tooltip
         * @returns {object} this - The tooltip object
         * @param {object} styles - A dictionary mapping CSS properties to values;
         */
        this.styles = function(value) {
            if (!arguments.length) {
                return insight.Utils.objectUnion(baseStyles, styles);
            }
            styles = value;
            return this;
        };

        /**
         * This method gets or sets the DOM element that this tooltip will be created inside, usually a div.
         * @memberof insight.Tooltip
         * @returns {DOMElement} element - A DOM Element
         */
        /**
         * @memberof insight.Tooltip
         * @returns {object} return - The tooltip object
         * @param {object} offset - The container DOM Element that this Tooltip should be added to.
         */
        this.container = function(chart) {
            if (!arguments.length) {
                return chartContainer;
            }

            chartContainer = chart;
            return this;
        };


        /**
         * This method displays the tooltip relative to the tooltip.container() DOMElement, using the provided element and tooltipText parameters to control the context and position.
         * @param {object[]} data - Description
         */
        this.show = function(element, tooltipText) {

            if (!this.element) {
                createElement();
            }

            setTooltipContent(tooltipText);

            var position = getTooltipPosition(element);

            drawTooltip(position);
        };


        /**
         * This method hides the tooltip
         */
        this.hide = function() {
            d3.select(self.element)
                .style('opacity', '0');
        };

    }


    return Tooltip;

})(insight);
