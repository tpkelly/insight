function Series(name, chart, data, x, y, color)
{

    this.chart = chart;
    this.data = data;
    this.x = x;
    this.y = y;
    this.name = name;
    this.color = d3.functor(color);
    this.animationDuration = 300;

    x.addSeries(this);
    y.addSeries(this);


    this.dataset = function()
    {
        //won't always be x that determins this (rowcharts, bullets etc.), need concept of ordering by data scale?
        var data = this.x.ordered() ? this.data.getOrderedData() : this.data.getData();

        return data;
    };

    this.keys = function()
    {
        return this.dataset()
            .map(this.keyAccessor);
    };


    this.keyAccessor = function(d)
    {
        return d.key;
    };

    this.valueAccessor = function(d)
    {
        return d.value;
    };


    this.matcher = this.keyAccessor;

    this.findMax = function() {};

    this.draw = function() {};
}
