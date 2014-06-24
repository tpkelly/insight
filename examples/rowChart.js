var data = [
{
    key: 'England',
    value: 53012456,
    value2: 1023131
},
{
    key: 'Scotland',
    value: 5295000,
    value2: 5675655
},
{
    key: 'Wales',
    value: 3063456,
    value2: 2342342
},
{
    key: 'Northern Ireland',
    value: 1810863,
    value2: 1231444
}];

$(document)
    .ready(function()
    {

        var exampleGroup = new Dashboard("Example Group");

        var dataset = new DataSet(data);

        var chart = new Chart('Chart 1', "#exampleChart")
            .width(450)
            .height(400)
            .margin(
            {
                top: 100,
                left: 150,
                right: 40,
                bottom: 0
            });

        var y = new Scale(chart, '', d3.scale.ordinal(), 'v', 'ordinal');
        var x = new Scale(chart, 'Population', d3.scale.linear(), 'h', 'linear');

        var series = new RowSeries('countryColumn', chart, dataset, x, y, 'silver')
            .yFunction(function(d)
            {
                return d.key;
            })
            .xFunction(function(d)
            {
                return d.value;
            })
            .tooltipFormat(InsightFormatters.numberFormatter);


        series.series = [
        {
            name: 'value',
            accessor: function(d)
            {
                return d.value;
            },
            label: 'Value',
            color: '#e67e22',
            tooltipValue: function(d)
            {
                return d.value;
            }
        },
        {
            name: 'value2',
            accessor: function(d)
            {
                return d.value2;
            },
            label: 'Value 2',
            color: '#2980b9',
            tooltipValue: function(d)
            {
                return d.value2;
            }
        }];

        chart.series([series]);

        var xAxis = new Axis(chart, "x", x, 'top')
            .textAnchor('end')
            .tickSize(5)
            .tickPadding(0)
            .labelOrientation('tb');

        var yAxis = new Axis(chart, "y", y, 'left');

        exampleGroup.addChart(chart);
        exampleGroup.initCharts();

        $('#toggle')
            .click(function(d)
            {
                series.stacked(!series.stacked());
                chart.draw();
            });
    });
