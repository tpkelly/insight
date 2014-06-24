$(document)
    .ready(function()
    {
        d3.json('countries.json', function(data)
        {

            var exampleGroup = new ChartGroup("Example Group");

            var dataset = new Group(data);

            var chart = new Chart('Chart 1', "#chart1")
                .width(600)
                .height(300)
                .margin(
                {
                    top: 10,
                    left: 50,
                    right: 40,
                    bottom: 40
                });

            var xScale = new Scale(chart, '', d3.scale.ordinal(), 'h', 'ordinal');
            var yScale = new Scale(chart, '', d3.scale.linear(), 'v', 'linear');

            var yScale2 = new Scale(chart, '', d3.scale.linear(), 'v', 'linear');

            var series = new ColumnSeries('countryColumn', chart, dataset, xScale, yScale, 'silver');
            var line = new LineSeries('valueLine', chart, dataset, xScale, yScale2, 'cyan')
                .yFunction(function(d)
                {
                    return d.pct;
                })
                .lineType('monotone')
                .tooltipFormat(InsightFormatters.percentageFormatter);

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


            chart.series([series, line]);

            var xAxis = new Axis(chart, "x", xScale, 'bottom')
                .textAnchor('middle');

            var yAxis = new Axis(chart, "y", yScale, 'left');
            var yAxis2 = new Axis(chart, "y2", yScale2, 'right')
                .format(InsightFormatters.percentageFormatter);

            exampleGroup.addChart(chart);

            exampleGroup.initCharts();
        });
    });
