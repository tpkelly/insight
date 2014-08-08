(function(insight) {
    /**
     * A tooltip, displaying values for a series or point when hovered over.
     * @class insight.Tooltip
     */
    insight.Tooltip = function Tooltip() {

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


        // Creates the tooltip element inside the defined container element.  It sets this.element.
        function createElement() {

            var element = d3.select(self.container())
                .append('div');

            element.attr('class', className)
                .style(self.styles());

            self.element = element.node();
        }

        // Updates the content of the tooltip.
        function setTooltipContent(content) {
            d3.select(self.element)
                .html(content);
        }


        // Calculates the position that the tooltip should be drawn at, relative to the provided HTML element.
        // It currently just returns the position centrally above the provided DOM element, however the coordinate system is in place to allow customization around the element.
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
         * The distance to which move the tooltip for this series relative to its default point.
         * @memberof! insight.Tooltip
         * @instance
         * @returns {object} - The {x,y} offset to place the tooltip from the point.
         *
         * @also
         *
         * Sets the distance to which move the tooltip for this series relative to its default point.
         * @memberof! insight.Tooltip
         * @instance
         * @param {object} offset The new distance to which move the tooltip for this series relative to its default point.
         * @returns {this}
         */
        this.offset = function(value) {
            if (!arguments.length) {
                return offset;
            }

            offset = value;
            return this;
        };

        /**
         * The current style for the tooltip.
         * @memberof! insight.Tooltip
         * @instance
         * @returns {object} - The style of the tooltip, in standard {'name': 'value', ...} format of CSS values.
         *
         * @also
         *
         * Sets the current style for the tooltip.
         * @memberof! insight.Tooltip
         * @instance
         * @param {object} style The new style of the tooltip, in standard {'name': 'value', ...} format of CSS values.
         * @returns {this}
         */
        this.styles = function(value) {
            if (!arguments.length) {
                return insight.Utils.objectUnion(baseStyles, styles);
            }
            styles = value;
            return this;
        };

        // Gets or sets the DOM element that this tooltip will be created inside, usually a div.
        this.container = function(container) {
            if (!arguments.length) {
                return chartContainer;
            }

            chartContainer = container;
            return this;
        };


        /*
         * Display the tooltip, using the provided element and tooltipText parameters to control the context and position.
         * @memberof! insight.Tooltip
         * @instance
         * @param {element} element The element to attach to.
         * @param {String} tooltipText The text to display on the tooltip.
         */
        this.show = function(element, tooltipText) {

            if (!this.element) {
                createElement();
            }

            setTooltipContent(tooltipText);

            var position = getTooltipPosition(element);

            drawTooltip(position);
        };


        /*
         * Hide the tooltip
         * @memberof! insight.Tooltip
         * @instance
         */
        this.hide = function() {
            d3.select(self.element)
                .style('opacity', '0');
        };

    };

})(insight);
