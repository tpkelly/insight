(function(insight, d3) {

    /**
     * Defines all scales that are supported by the library.
     * @namespace insight.Scales
     */
    insight.Scales = {

        /**
         * An ordinal scale, which uses a set of distinct values, such as genders or countries.
         */
        Ordinal: new insight.Scale('ordinal', d3.scale.ordinal),

        /**
         * A linear scale, which has a continuous domain where any value from an input range can be mapped to an
         * output domain.
         */
        Linear: new insight.Scale('linear', d3.scale.linear),

        /**
         * A time scale, which is similar to a linear scale, but the values are represented as
         * [javascript Dates]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}
         * rather than numbers.
         */
        Time: new insight.Scale('time', d3.time.scale)
    };

}(insight, d3));
