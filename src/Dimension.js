var Dimension = function Dimension(name, dimension, displayFunction) {
    this.Dimension = dimension;
    this.Name = name;
    this.Filters = [];

    this.displayFunction = displayFunction ? displayFunction : function(d) {
        return d;
    };

    this.comparer = function(d) {
        return d.Name == this.Name;
    }.bind(this);
};
