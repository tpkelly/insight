$(document)
    .ready(function()
    {
        d3.json('datasets/countries.json', function(data)
        {
            var dataset = new insight.DataSet(data);

            var x = new insight.Axis('Country', insight.Scales.Ordinal)
                .textAnchor('middle');

            var y1 = new insight.Axis('Value', insight.Scales.Linear);

            var y2 = new insight.Axis('Percentage', insight.Scales.Linear)
                .tickLabelFormat(insight.Formatters.percentageFormatter)
                .reversedPosition(true);


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

            chart.xAxis(x);
            chart.yAxes([y1, y2]);

            var series = new insight.ColumnSeries('countryColumn', dataset, x, y1, 'silver')
                .keyFunction(function(d)
                {
                    return d.country;
                });

            var line = new insight.LineSeries('valueLine', dataset, x, y2, 'cyan')
                .keyFunction(function(d)
                {
                    return d.country;
                })
                .valueFunction(function(d)
                {
                    return d.pct;
                })
                .lineType('monotone')
                .tooltipFormat(insight.Formatters.percentageFormatter);

            series.series = [
            {
                name: 'value',
                valueFunction: function(d)
                {
                    return d.value;
                },
                label: 'Value',
                color: '#e67e22'
            },
            {
                name: 'value2',
                valueFunction: function(d)
                {
                    return d.value2;
                },
                label: 'Value 2',
                color: '#2980b9'
            }];


            chart.series([series, line]);

            chart.draw();
        });
    });
