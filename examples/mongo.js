$(document)
    .ready(function()
    {
        d3.json('datasets/mongo.json', function(data)
        {

            var dataset = new insight.DataSet(data);


            var clients = dataset.group('client', function(d)
            {
                return d.clients;
            });

            console.log(clients.getData());


            clients.dimension.crossfilterDimension.filter(1);

            console.log(dataset.ndx.groupAll()
                .value());

            var writeChart = new insight.Chart('writeSpeed', '#writes')
                .width(600)
                .height(200)
                .margin(
                {
                    top: 0,
                    left: 350,
                    bottom: 50,
                    right: 0
                });

            var x = new insight.Axis('', insight.Scales.Linear)
                .tickOrientation('tb');

            var y = new insight.Axis('Writes/Sec', insight.Scales.Ordinal);

            writeChart.xAxis(x);
            writeChart.yAxis(y);

            var series = new insight.RowSeries('writes', dataset, x, y, '#3498db')
                .keyFunction(function(d)
                {
                    return d.label;
                })
                .valueFunction(function(d)
                {
                    return d.write_speed.minutes;
                })
                .tooltipFunction(function(d)
                {
                    return 'Writes: ' + d.write_speed.minutes + '</br>Q/s: ' + d.queries_per_second;
                });


            writeChart.series([series]);

            writeChart.draw();

        });
    });
