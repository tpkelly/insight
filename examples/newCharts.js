$(document)
    .ready(function()
    {
        d3.json('countries.json', function(data)
        {
            var dataset = new insight.DataSet(data);

            var chart = new insight.Chart('Chart 1', "#chart1")
                .width(600)
                .height(300)
                .margin(
                {
                    top: 10,
                    left: 50,
                    right: 40,
                    bottom: 40
                });

            var xScale = new insight.Scale(chart, '', 'h', Scales.Ordinal);
            var yScale = new insight.Scale(chart, '', 'v', Scales.Linear);

            var yScale2 = new insight.Scale(chart, '', 'v', Scales.Linear);

            var series = new insight.ColumnSeries('countryColumn', chart, dataset, xScale, yScale, 'silver');
            var line = new insight.LineSeries('valueLine', chart, dataset, xScale, yScale2, 'cyan')
                .valueFunction(function(d)
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

            var xAxis = new insight.Axis(chart, "x", xScale, 'bottom')
                .textAnchor('middle');

            var yAxis = new insight.Axis(chart, "y", yScale, 'left');
            var yAxis2 = new insight.Axis(chart, "y2", yScale2, 'right')
                .labelFormat(InsightFormatters.percentageFormatter);

            insight.drawCharts();
        });
    });
