(function(insight, d3) {

    /**
     * Defines all scales that are supported by the library.
     * @namespace insight.scales
     */
    insight.scales = {};

    /**
     * A named scale which is used by an {@link insight.Axis}. It is recommended to use the {@link insight.scales}
     * 'enum' to create a scale rather than create one directly.
     * @class insight.scales.Scale
     * @param {String} name The name of the scale.
     * properties, such as {@link insight.scales.linear}.
     * @param {Object} scale A [D3 scale]{@link https://github.com/mbostock/d3/wiki/Scales}.
     */
    insight.scales.Scale = function Scale(name, scale) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Public variables -------------------------------------------------------------------------------------------

        /**
         * The name of the scale.
         * @memberof! insight.scales.Scale
         * @instance
         * @type {String}
         */
        self.name = name;

        /**
         * A [D3 scale]{@link https://github.com/mbostock/d3/wiki/Scales}.
         * @memberof! insight.scales.Scale
         * @instance
         * @type {Object}
         */
        self.scale = scale;

    };

    /**
     * An ordinal scale, which uses a set of distinct values, such as genders or countries.
     * @type {insight.scales.Scale}
     */
    insight.scales.ordinal = new insight.scales.Scale('ordinal', d3.scale.ordinal);

    /**
     * A linear scale, which has a continuous domain where any value from an input range can be mapped to an
     * output domain.
     * @type {insight.scales.Scale}
     */
    insight.scales.linear = new insight.scales.Scale('linear', d3.scale.linear);

    /**
     * A time scale, which is similar to a linear scale, but the values are represented as
     * [javascript Dates]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}
     * rather than numbers.
     * @type {insight.scales.Scale}
     */
    insight.scales.time = new insight.scales.Scale('time', d3.time.scale);

}(insight, d3));
