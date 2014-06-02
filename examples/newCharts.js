var data = [{
    key: 'England',
    value: 10,
    value2:5,
    pct: 0.5
}, {
    key: 'Scotland',
    value: 20,
    value2:7,
    pct: 0.78
}, {
    key: 'Wales',
    value: 13,
    value2:18,
    pct: 0.25
}, {
    key: 'Ireland',
    value: 15,
    value2:10,
    pct: 0.9
}];

$(document)
    .ready(function() {

        var exampleGroup = new ChartGroup("Example Group");

        var dataset = new Group(data);

        var chart = new Chart('Chart 1', "#chart1")
            .width(600)
            .height(300)
            .margin({top:10, left:50, right: 40, bottom: 40});

        var xScale = new Scale(chart, d3.scale.ordinal(), 'h', 'ordinal');
        var yScale = new Scale(chart, d3.scale.linear(), 'v', 'linear');

        var yScale2 = new Scale(chart, d3.scale.linear(), 'v', 'linear');

        var series = new ColumnSeries('countryColumn', chart, dataset, xScale, yScale, 'silver');
        var line = new LineSeries('valueLine', chart, dataset, xScale, yScale2, 'cyan');

        series.series = [
            {
                name: 'value',
                accessor: function(d){
                    return d.value;
                },
                label: 'Value',
                color: '#e67e22',
                tooltipValue: function(d){return d.value;}
            },
            {
                name: 'value2',
                accessor: function(d){
                    return d.value2;
                },
                label: 'Value 2',
                color: '#2980b9',
                tooltipValue: function(d){return d.value2;}
            }
        ];

        line.valueAccessor = function(d){return d.pct;};

        chart.scales().push(xScale);
        chart.scales().push(yScale);
        chart.scales().push(yScale2);

        chart.series([series, line]);

        var xAxis = new Axis(chart, xScale, 'bottom');
        var yAxis = new Axis(chart, yScale, 'left');
        var yAxis2 = new Axis(chart, yScale2, 'right').format(InsightFormatters.percentageFormatter);

        exampleGroup.addChart(chart);
        
        exampleGroup.initCharts();
        
    });

