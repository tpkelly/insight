$(document)
    .ready(function()
    {
        d3.json('datasets/mongo.json', function(data)
        {

            var dataset = new insight.DataSet(data);

            var chartGroup = new insight.ChartGroup();

            var writeChart = new insight.Chart('writeSpeed', '#writes')
                .width(400)
                .height(600)
                .margin(
                {
                    top: 0,
                    left: 100,
                    bottom: 300,
                    right: 0
                });

            var x = new insight.Axis('', insight.Scales.Ordinal)
                .tickOrientation('tb');


            var y = new insight.Axis('Writes/Sec', insight.Scales.Linear);

            writeChart.xAxis(x);
            writeChart.yAxis(y);

            var series = new insight.ColumnSeries('writes', dataset, x, y, '#3498db')
                .keyFunction(function(d)
                {
                    return d.label;
                })
                .valueFunction(function(d)
                {
                    return d.write_speed.minutes;
                });


            writeChart.series([series]);

            // reads

            var qpsChart = new insight.Chart('readSpeed', '#reads')
                .width(400)
                .height(600)
                .margin(
                {
                    top: 0,
                    left: 150,
                    bottom: 300,
                    right: 0
                });

            var rx = new insight.Axis('', insight.Scales.Ordinal)
                .tickOrientation('tb');


            var ry = new insight.Axis('Queries/Sec', insight.Scales.Linear);

            qpsChart.xAxis(rx);
            qpsChart.yAxis(ry);

            var reads = new insight.ColumnSeries('qps', dataset, rx, ry, '#3498db')
                .keyFunction(function(d)
                {
                    return d.label;
                })
                .valueFunction(function(d)
                {
                    return d.queries_per_second;
                });

            qpsChart.series([reads]);

            chartGroup.add(writeChart);
            chartGroup.add(qpsChart);

            chartGroup.draw();
        });
    });
