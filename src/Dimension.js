var Dimension = function Dimension(name, dimension, displayFunction) {
    this.Dimension = dimension;
    this.Name = name;
    this.Filters = ko.observableArray();
    this.Keys = this.Dimension.group().all().map(function (d) { return d.key; });
    this.displayFunction = displayFunction ? displayFunction : function (d) { return d; };
}