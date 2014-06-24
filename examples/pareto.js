$(document)
    .ready(function()
    {
        d3.json('revenuereport.json', function(data)
        {

            var dashboard = new Dashboard("Example Group");

            var dataset = dashboard.addData(data);

            var clientData = dashboard.group(dataset, 'clients', function(d)
                {
                    return d.Client;
                })
                .sum(['CurrentRevenue'])
                .cumulative(['CurrentRevenue.Sum'])
                .orderFunction(function(a, b)
                {
                    return b.value.CurrentRevenue.Sum - a.value.CurrentRevenue.Sum;
                });


            computeGroupValues(clientData);

            console.log(clientData.getData());

            var chart = new Chart('Chart 1', "#chart1")
                .width(500)
                .height(400)
                .margin(
                {
                    top: 10,
                    left: 130,
                    right: 45,
                    bottom: 150
                });

            var x = new Scale(chart, 'Client', d3.scale.ordinal(), 'h', 'ordinal')
                .ordered(true);

            var y = new Scale(chart, 'Revenue', d3.scale.linear(), 'v', 'linear');
            var y2 = new Scale(chart, '%', d3.scale.linear(), 'v', 'linear');

            var series = new ColumnSeries('clientColumn', chart, clientData, x, y); //.tooltipFormat(InsightFormatters.currencyFormatter);

            var line = new LineSeries('percentLine', chart, clientData, x, y2, 'cyan')
                .tooltipFormat(InsightFormatters.percentageFormatter)
                .yFunction(function(d)
                {
                    return d.value.Percentage;
                });

            series.series = [
            {
                name: 'value',
                accessor: function(d)
                {
                    return d.value.CurrentRevenue.Sum;
                },
                color: '#e74c3c',
                tooltipValue: function(d)
                {
                    return InsightFormatters.currencyFormatter(d.value.CurrentRevenue.Sum);
                }
            }];


            chart.series([series, line]);

            var xAxis = new Axis(chart, "x", x, 'bottom')
                .textAnchor('start')
                .labelOrientation('tb');

            var yAxis = new Axis(chart, "y", y, 'left')
                .format(InsightFormatters.currencyFormatter);

            var yAxis2 = new Axis(chart, "y2", y2, 'right')
                .format(InsightFormatters.percentageFormatter);


            dashboard.addChart(chart);

            dashboard.initCharts();
        });
    });


function computeGroupValues(group)
{
    var aggregateFunction = function()
    {

        var self = this;
        var total = 0;

        this.getData()
            .forEach(function(d)
            {
                total += d.value.CurrentRevenue.Sum;
            });
        this.getData()
            .forEach(function(d)
            {
                d.value.Percentage = d.value.CurrentRevenue.SumCumulative / total;
            });

    }.bind(group);

    group.computeFunction(aggregateFunction);
    group.recalculate();
}
