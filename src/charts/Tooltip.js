/**
 * The Tooltip class
 * @class insight.Tooltip
 * @param {string} name - A uniquely identifying name for this chart
 * @param {string} element - The css selector identifying the div container that the chart will be drawn in. '#columnChart' for example.
 */
insight.Tooltip = (function(insight) {

    function Tooltip() {

        // Private variables
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


        /*
         * This method creates the tooltip element inside the defined container element.  It sets this.element.
         */
        function createElement() {

            var element = d3.select(self.container())
                .append('div');

            element.attr('class', className)
                .style(self.styles());

            self.element = element.node();
        }

        /*
         This method updates the content of the tooltip.
         @param {string} content - Textual or HTML content to display inside the tooltip div
         */
        function setTooltipContent(content) {
            d3.select(self.element)
                .html(content);
        }


        /*
          This method calculates the position that the tooltip should be drawn at, relative to the provided HTML element.
          It currently just returns the position centrally above the provided DOM element, however the coordinate system is in place to allow customization around the element.
          @returns {object} point - an {x,y} point object representing the north point of the provided DOM element, in relation to the top left corner of its SVG container (not the page).
          @param {DOMElement} target - The target element to calculate the position from.
         */
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

        /*
         * Given a coordinate {x,y} position, this method updates the position and visibility of the tooltip to display it.
         * @param {object} point - an {x,y} coordinate, from the top left of the tooltip's container SVG.
         */
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
         * The offset amounts for the tooltip, in an offset object {x, y}.
         * @memberof! insight.Tooltip
         * @instance
         * @returns {object} - An offset object with x and y values for offsetting the position of the tooltip.
         * @also
         * Sets the offset amounts for the tooltip, in an offset object {x, y}.
         * @memberof! insight.Tooltip
         * @instance
         * @returns {this}
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
         * @memberof! insight.Tooltip
         * @instance
         * @returns {object} styles - A dictionary object of CSS property names and values
         * @also
         * @instance
         * @memberof! insight.Tooltip
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
         * @memberof! insight.Tooltip
         * @instance
         * @returns {DOMElement} element - A DOM Element
         * @also
         * @memberof! insight.Tooltip
         * @instance
         * @returns {this} return
         * @param {object} offset - The container DOM Element that this Tooltip should be added to.
         */
        this.container = function(container) {
            if (!arguments.length) {
                return chartContainer;
            }

            chartContainer = container;
            return this;
        };


        /**
         * This method displays the tooltip relative to the tooltip.container() DOMElement, using the provided element and tooltipText parameters to control the context and position.
         * @memberof! insight.Tooltip
         * @instance
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
         * @memberof! insight.Tooltip
         * @instance
         */
        this.hide = function() {
            d3.select(self.element)
                .style('opacity', '0');
        };

    }


    return Tooltip;

})(insight);
