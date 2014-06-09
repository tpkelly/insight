function DataSet(data)
{

    this._data = data;
}


DataSet.prototype.initialize = function() {

};

DataSet.prototype.filterFunction = function(f)
{
    if (!arguments.length)
    {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

DataSet.prototype.getData = function()
{
    var data;
    if (this._data.all)
    {
        data = this._data.all();
    }
    else
    {
        //not a crossfilter set
        data = this._data;
    }

    if (this._filterFunction)
    {
        data = data.filter(this._filterFunction);
    }

    return data;
};


DataSet.prototype.getOrderedData = function()
{
    var data;

    data = this._data.sort(this.orderFunction());

    if (this._filterFunction)
    {
        data = data.filter(this._filterFunction);
    }

    return data;
};
