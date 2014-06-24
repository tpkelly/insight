var data = [
{
    key: 'England',
    value: 53012456
},
{
    key: 'Scotland',
    value: 5295000
},
{
    key: 'Wales',
    value: 3063456
},
{
    key: 'Northern Ireland',
    value: 1810863
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
                top: 10,
                left: 150,
                right: 40,
                bottom: 120
            });

        var x = new Scale(chart, '', d3.scale.ordinal(), 'h', 'ordinal');
        var y = new Scale(chart, 'Population', d3.scale.linear(), 'v', 'linear');

        var series = new ColumnSeries('countryColumn', chart, dataset, x, y, 'silver')
            .yFunction(function(d)
            {
                return d.value;
            })
            .tooltipFormat(InsightFormatters.currencyFormatter);

        chart.series([series]);

        var xAxis = new Axis(chart, "x", x, 'bottom')
            .labelOrientation('tb');

        var yAxis = new Axis(chart, "y", y, 'left')
            .format(d3.format("0,000"));

        exampleGroup.addChart(chart);
        exampleGroup.initCharts();
    });
