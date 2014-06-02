var data = [{
    key: 'England',
    value: 10,
    value2:5
}, {
    key: 'Scotland',
    value: 20,
    value2:7
}, {
    key: 'Wales',
    value: 13,
    value2:18
}, {
    key: 'Ireland',
    value: 15,
    value2:10
}];

$(document)
    .ready(function() {

        var exampleGroup = new ChartGroup("Example Group");

        var dataset = new Group(data);

        var chart = new Chart('Chart 1', "#chart1")
            .width(600)
            .height(300)
            .margin({top:0, left:50, right: 0, bottom: 40});

        var xScale = new Scale(chart, d3.scale.ordinal(), 'down', 'ordinal');
        var yScale = new Scale(chart, d3.scale.linear(), 'up', 'linear');

        var series = new ColumnSeries('countryColumn', chart, dataset, xScale, yScale, 'silver');
        var line = new LineSeries('valueLine', chart, dataset, xScale, yScale, 'cyan');

        series.series = [
            {
                name: 'value',
                accessor: function(d){
                    return d.value;
                },
                label: 'Value',
                color: 'silver',
                tooltipValue: function(d){return d.value;}
            },
            {
                name: 'value2',
                accessor: function(d){
                    return d.value2;
                },
                label: 'Value 2',
                color: '#333',
                tooltipValue: function(d){return d.value2;}
            }
        ];

        chart.scales().push(xScale);
        chart.scales().push(yScale);

        chart.series([series, line]);

        var xAxis = new Axis(chart, xScale, 'h', 'left');
        var yAxis = new Axis(chart, yScale, 'v', 'bottom');


        exampleGroup.addChart(chart);
        
        exampleGroup.initCharts();
        
    });
