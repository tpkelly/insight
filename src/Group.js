var Group = function Group(data, cumulative) {
    this.Data = ko.observable(data);
    this.cumulative = cumulative;
};

Group.prototype.filterFunction = function(f) {
    if (!arguments.length) {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Group.prototype.getData = function() {
    var data = this.Data().all();

    if (this._filterFunction) {
        data = this.Data().all().filter(this._filterFunction);
    }
    return data;
};
