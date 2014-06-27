var data = [
{
    key: 'Performance Metric',
    value: 1230,
    target: 3000,
    bad: 800,
    acceptable: 1500,
    good: 2000
}];

$(document)
    .ready(function()
    {
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Chart 1', "#exampleChart")
            .width(600)
            .height(80)
            .margin(
            {
                top: 0,
                bottom: 0,
                left: 150,
                right: 0
            });


        chart.addBulletChart(
        {
            name: 'bulletChart',
            ranges: [
            {
                name: 'bad',
                data: dataset,
                color: 'orange',
                accessor: function(d)
                {
                    return d.bad;
                }
            },
            {
                name: 'acceptable',
                data: dataset,
                color: 'yellow',
                accessor: function(d)
                {
                    return d.acceptable;
                }
            },
            {
                name: 'good',
                data: dataset,
                color: 'lightblue',
                accessor: function(d)
                {
                    return d.good;
                }
            }],
            target:
            {
                name: 'target',
                data: dataset,
                color: '#444',
                accessor: function(d)
                {
                    return d.target;
                }
            },
            value:
            {
                name: 'value',
                data: dataset,
                color: '#444',
                accessor: function(d)
                {
                    return d.value;
                }
            }
        })
        var yAxis = new insight.Axis(chart, "y", chart.series()[0].y, 'left')
            .tickSize(5)
            .tickPadding(5)
            .label("");

        insight.drawCharts();

    });
