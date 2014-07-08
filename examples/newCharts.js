$(document)
    .ready(function()
    {
        d3.json('countries.json', function(data)
        {
            var dataset = new insight.DataSet(data);

            var chart = new insight.Chart('Chart 1', "#chart1")
                .width(700)
                .height(300)
                .margin(
                {
                    top: 10,
                    left: 90,
                    right: 140,
                    bottom: 40
                });

            var xScale = new insight.Axis(chart, 'Country', 'h', insight.Scales.Ordinal, 'bottom')
                .textAnchor('middle');;
            var yScale = new insight.Axis(chart, 'Value', 'v', insight.Scales.Linear, 'left');

            var yScale2 = new insight.Axis(chart, 'Percentage', 'v', insight.Scales.Linear, 'right')
                .labelFormat(InsightFormatters.percentageFormatter);;


            var series = new insight.ColumnSeries('countryColumn', chart, dataset, xScale, yScale, 'silver');
            var line = new insight.LineSeries('valueLine', chart, dataset, xScale, yScale2, '#e44')
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

            insight.drawCharts();
        });
    });
