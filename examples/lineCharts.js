$(document)
    .ready(function()
    {
        d3.json('datasets/revenuereport.json', function(data)
        {
            data.forEach(function(item)
            {
                item.Date = new Date(item.Date);
            });

            var dataset = new insight.DataSet(data);

            var dateData = dataset.group('date', function(d)
                {
                    return d.Date;
                })
                .sum(['CurrentRevenue'])
                .cumulative(['CurrentRevenue.Sum']);



            var x = new insight.Axis('Time', insight.Scales.Time)
                .tickLabelOrientation('tb')
                .tickLabelFormat(insight.Formatters.dateFormatter)
                .showGridlines(true);

            var y = new insight.Axis('Revenue', insight.Scales.Linear)
                .showGridlines(true);


            var chart = new insight.Chart('Chart 1', "#exampleChart")
                .width(700)
                .height(350)
                .margin(
                {
                    top: 0,
                    left: 130,
                    right: 100,
                    bottom: 100
                })
                .legend(new insight.Legend());

            chart.xAxis(x);
            chart.yAxis(y);

            var line = new insight.LineSeries('Revenue', dateData, x, y, '#aae')
                .tooltipFormat(insight.Formatters.currencyFormatter)
                .lineType('monotone')
                .valueFunction(function(d)
                {
                    return d.value.CurrentRevenue.SumCumulative;
                });

            chart.series()
                .push(line);

            chart.zoomable(x);

            chart.draw();
        });
    });
