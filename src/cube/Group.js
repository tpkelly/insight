function Group(data)
{
    this._data = data;
    this._cumulative = false;
    this._valueAccessor = function(d)
    {
        return d;
    };
    this._orderFunction = function(a, b)
    {
        return b.value - a.value;
    };
    this._ordered = false;
}

Group.prototype.filterFunction = function(f)
{
    if (!arguments.length)
    {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Group.prototype.cumulative = function(c)
{
    if (!arguments.length)
    {
        return this._cumulative;
    }
    this._cumulative = c;
    return this;
};

Group.prototype.getData = function()
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

Group.prototype.getOrderedData = function()
{
    var data;

    if (this._data.all)
    {
        data = data = this._data.top(Infinity)
            .sort(this.orderFunction());
    }
    else
    {
        data = this._data.sort(this.orderFunction());
    }

    if (this._filterFunction)
    {
        data = data.filter(this._filterFunction);
    }

    return data;
};


Group.prototype.computeFunction = function(c)
{
    this._ordered = true;
    if (!arguments.length)
    {
        return this._compute;
    }
    this._compute = c;
    return this;
};


Group.prototype.orderFunction = function(o)
{
    if (!arguments.length)
    {
        return this._orderFunction;
    }
    this._orderFunction = o;
    return this;
};

Group.prototype.compute = function()
{
    this._compute();
};

Group.prototype.valueAccessor = function(v)
{
    if (!arguments.length)
    {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};


Group.prototype.calculateTotals = function()
{
    if (this._cumulative)
    {
        var totals = {};
        var total = 0;
        var self = this;
        var data = this._ordered ? this.getOrderedData() : this.getData();

        data
            .forEach(function(d, i)
            {

                var value = self._valueAccessor(d);

                if (typeof(value) != "object")
                {
                    total += value;
                    d.Cumulative = total;
                }
                else
                {
                    for (var property in value)
                    {
                        var totalName = property + 'Cumulative';

                        if (totals[totalName])
                        {
                            totals[totalName] += value[property];
                            value[totalName] = totals[totalName];
                        }
                        else
                        {
                            totals[totalName] = value[property];
                            value[totalName] = totals[totalName];
                        }
                    }
                }
            });
    }
    return this;
};


function SimpleGroup(data)
{
    this._data = data;
    this._orderFunction = function(a, b)
    {
        return b.values - a.values;
    };
}
SimpleGroup.prototype = Object.create(Group.prototype);
SimpleGroup.prototype.constructor = SimpleGroup;

SimpleGroup.prototype.getOrderedData = function()
{
    return this._data.sort(this._orderFunction);
};

SimpleGroup.prototype.getData = function()
{
    return this._data;
};

function NestedGroup(dimension, nestFunction)
{
    this._dimension = dimension;
    this._data = dimension.Dimension.bottom(Infinity);
    this._nestFunction = nestFunction;
    this._nestedData = nestFunction.entries(this._data);
}


NestedGroup.prototype = Object.create(Group.prototype);
NestedGroup.prototype.constructor = NestedGroup;


NestedGroup.prototype.getData = function()
{
    return this._nestedData;
};

NestedGroup.prototype.updateNestedData = function()
{
    this._data = this._dimension.Dimension.bottom(Infinity);
    this._nestedData = this._nestFunction.entries(this._data);
};


NestedGroup.prototype.getOrderedData = function()
{
    return this._nestedData;
};
