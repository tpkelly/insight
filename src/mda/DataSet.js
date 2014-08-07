(function(insight) {
    /**
     * A DataSet is wrapper around a simple object array, but providing some functions that are required by charts to load and filter data.
     * A DataSet should be used with an array of data that is to be charted without being used in a crossfilter or dimensional dataset.
     * @class insight.DataSet
     * @constructor
     * @param {object[]} data - The short name used to identify this dimension, and any linked dimensions sharing the same name
     */
    insight.DataSet = function DataSet(data) {

        this.data = data;

        this.crossfilterData = null;

        this._orderFunction = function(a, b) {
            return b.value - a.value;
        };

        this._filterFunction = null;
    };

    insight.DataSet.prototype.initialize = function() {

    };

    insight.DataSet.prototype.filterFunction = function(f) {
        if (!arguments.length) {
            return this._filterFunction;
        }
        this._filterFunction = f;
        return this;
    };

    insight.DataSet.prototype.getData = function() {
        var data;
        if (this.data.all) {
            data = this.data.all();
        } else {
            //not a crossfilter set
            data = this.data;
        }

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };

    insight.DataSet.prototype.orderFunction = function(o) {
        if (!arguments.length) {
            return this._orderFunction;
        }
        this._orderFunction = o;
        return this;
    };

    insight.DataSet.prototype.filterFunction = function(f) {
        if (!arguments.length) {
            return this._filterFunction;
        }
        this._filterFunction = f;
        return this;
    };

    insight.DataSet.prototype.getOrderedData = function() {
        var data;

        data = this.data.sort(this._orderFunction);

        if (this._filterFunction) {
            data = data.filter(this._filterFunction);
        }

        return data;
    };


    insight.DataSet.prototype.group = function(name, groupFunction, oneToMany) {

        this.crossfilterData = this.crossfilterData || crossfilter(this.data);

        var dim = new insight.Dimension(name, this.crossfilterData, groupFunction, oneToMany);

        var group = new insight.Grouping(dim);

        return group;
    };

})(insight);
