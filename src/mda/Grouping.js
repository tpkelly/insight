function Grouping(dimension)
{
    this._cumulative = false;
    this.dimension = dimension;

    var sumProperties = [];
    var countProperties = [];
    var averageProperties = [];

    this._valueAccessor = function(d)
    {
        return d;
    };

    this._orderFunction = function(a, b)
    {
        return b.value - a.value;
    };

    this._ordered = false;

    this.sum = function(_)
    {
        if (!arguments.length)
        {
            return sumProperties;
        }
        sumProperties = _;
        return this;
    };

    this.count = function(_)
    {
        if (!arguments.length)
        {
            return countProperties;
        }
        countProperties = _;
        return this;
    };

    this.average = function(_)
    {
        if (!arguments.length)
        {
            return averageProperties;
        }
        averageProperties = _;

        sumProperties = this.unique(sumProperties.concat(averageProperties));

        return this;
    };

    return this;
}

Grouping.prototype.filterFunction = function(f)
{
    if (!arguments.length)
    {
        return this._filterFunction;
    }
    this._filterFunction = f;
    return this;
};

Grouping.prototype.cumulative = function(c)
{
    if (!arguments.length)
    {
        return this._cumulative;
    }
    this._cumulative = c;
    return this;
};

Grouping.prototype.unique = function(array)
{
    var a = array.concat();
    for (var i = 0; i < a.length; ++i)
    {
        for (var j = i + 1; j < a.length; ++j)
        {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

Grouping.prototype.initialize = function()
{
    var propertiesToSum = this.sum();
    var propertiesToCount = this.count();
    var propertiesToAverage = this.average();

    var data = this.dimension.Dimension.group()
        .reduce(
            function(p, v)
            {
                p.Count++;

                for (var property in propertiesToSum)
                {
                    if (v.hasOwnProperty(propertiesToSum[property]))
                    {
                        p[propertiesToSum[property]].Sum += v[propertiesToSum[property]];
                    }
                }

                for (var avProperty in propertiesToAverage)
                {
                    if (v.hasOwnProperty(propertiesToAverage[avProperty]))
                    {
                        p[propertiesToAverage[avProperty]].Average = p[propertiesToAverage[avProperty]].Average + ((v[propertiesToAverage[avProperty]] - p[propertiesToAverage[avProperty]].Average) / p.Count);
                    }
                }

                for (var countProp in propertiesToCount)
                {
                    if (v.hasOwnProperty(propertiesToCount[countProp]))
                    {
                        p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] = p[propertiesToCount[countProp]].hasOwnProperty(v[propertiesToCount[countProp]]) ? p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] + 1 : 1;
                        p[propertiesToCount[countProp]].Total++;
                    }
                }

                return p;
            },
            function(p, v)
            {
                p.Count--;

                for (var property in propertiesToSum)
                {
                    if (v.hasOwnProperty(propertiesToSum[property]))
                    {
                        p[propertiesToSum[property]].Sum -= v[propertiesToSum[property]];
                    }
                }


                for (var countProp in propertiesToCount)
                {
                    if (v.hasOwnProperty(propertiesToCount[countProp]))
                    {
                        p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] = p[propertiesToCount[countProp]].hasOwnProperty(v[propertiesToCount[countProp]]) ? p[propertiesToCount[countProp]][v[propertiesToCount[countProp]]] - 1 : 1;
                        p[propertiesToCount[countProp]].Total--;
                    }
                }

                for (var avProperty in propertiesToAverage)
                {
                    if (v.hasOwnProperty(propertiesToAverage[avProperty]))
                    {
                        var valRemoved = v[propertiesToAverage[avProperty]];
                        var sum = p[propertiesToAverage[avProperty]].Sum;
                        p[propertiesToAverage[avProperty]].Average = sum / p.Count;

                        var result = p[propertiesToAverage[avProperty]].Average;

                        if (!isFinite(result))
                        {
                            p[propertiesToAverage[avProperty]].Average = 0;
                        }
                    }
                }


                return p;
            },
            function()
            {
                var p = {
                    Count: 0
                };

                for (var property in propertiesToSum)
                {
                    p[propertiesToSum[property]] = p[propertiesToSum[property]] ? p[propertiesToSum[property]] :
                    {};
                    p[propertiesToSum[property]].Sum = 0;
                }
                for (var avProperty in propertiesToAverage)
                {
                    p[propertiesToAverage[avProperty]] = p[propertiesToAverage[avProperty]] ? p[propertiesToAverage[avProperty]] :
                    {};
                    p[propertiesToAverage[avProperty]].Average = 0;
                }
                for (var countProp in propertiesToCount)
                {
                    p[propertiesToCount[countProp]] = p[propertiesToCount[countProp]] ? p[propertiesToCount[countProp]] :
                    {};
                    p[propertiesToCount[countProp]].Total = 0;
                }
                return p;
            }
        );

    this._data = data;

    return this;
};




Grouping.prototype.getData = function()
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

Grouping.prototype.getOrderedData = function()
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


Grouping.prototype.computeFunction = function(c)
{
    this._ordered = true;
    if (!arguments.length)
    {
        return this._compute;
    }
    this._compute = c;
    return this;
};


Grouping.prototype.orderFunction = function(o)
{
    if (!arguments.length)
    {
        return this._orderFunction;
    }
    this._orderFunction = o;
    return this;
};

Grouping.prototype.compute = function()
{
    this._compute();
};

Grouping.prototype.valueAccessor = function(v)
{
    if (!arguments.length)
    {
        return this._valueAccessor;
    }
    this._valueAccessor = v;
    return this;
};


Grouping.prototype.calculateTotals = function()
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
