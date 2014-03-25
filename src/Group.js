function Group(data) {
    this._data = data;
}

Group.prototype.filterFunction = function(f) {
    if (!arguments.length) {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Group.prototype.getData = function() {
    var data = this._data.all();

    if (this._filterFunction) {
        data = this._data.all()
            .filter(this._filterFunction);
    }
    return data;
};



function CumulativeGroup(data, filterFunction) {
    Group.call(this, data);

    this.cumulative = true;
    this._filterFunction = filterFunction;
    this._valueAccessor = function(d) {
        return d;
    };
}

CumulativeGroup.prototype = Object.create(Group.prototype);
CumulativeGroup.prototype.constructor = CumulativeGroup;

CumulativeGroup.prototype.valueAccessor = function(v) {
    if (!arguments.length) {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};

CumulativeGroup.prototype.calculateTotals = function() {
    var totals = {};
    var self = this;

    this.getData()
        .forEach(function(d, i) {

            var value = self._valueAccessor(d);

            for (var property in value) {
                var totalName = property + 'Cumulative';

                if (totals[totalName]) {
                    totals[totalName] += value[property];
                    value[totalName] = totals[totalName];
                } else {
                    totals[totalName] = value[property];
                    value[totalName] = totals[totalName];
                }
            }
        });

    return this;
};
