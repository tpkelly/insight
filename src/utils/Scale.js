(function(insight) {

    /**
     * A named scale which is used by an {@link insight.Axis}. It is recommended to use the {@link insight.Scales}
     * 'enum' to create a scale rather than create one directly.
     * @class insight.Scale
     * @param {String} name The name of the scale.
     * properties, such as {@link insight.Scale.Linear}.
     * @param {Object} scale A [D3 scale]{@link https://github.com/mbostock/d3/wiki/Scales}.
     */
    insight.Scale = function Scale(name, scale) {

        // Private variables ------------------------------------------------------------------------------------------

        var self = this;

        // Public variables -------------------------------------------------------------------------------------------

        self.name = name;
        self.scale = scale;

    };


}(insight));
