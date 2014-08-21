$(document)
    .ready(function()
    {
        function preprocess(data)
        {
            data.forEach(function(d)
            {
                d.releaseDate = new Date(d.releaseDate);
                d.fileSizeBytes = +d.fileSizeBytes;
            });
        }

        d3.json('datasets/appstore.json', function(data)
        {
            preprocess(data);

            var dataset = new insight.DataSet(data);

            var dates = dataset.group('date', function(d)
                {
                    return new Date(d.releaseDate.getFullYear(), d.releaseDate.getMonth(), 1);
                })
                .filterFunction(function(d)
                {
                    return d.key < new Date(2014, 0, 1);
                });


            var timeChart = new insight.Chart('Releases over time', '#exampleChart')
                .width(600)
                .height(325);

            var xTime = new insight.Axis('', insight.Scales.Time)
                .tickLabelOrientation('tb')
                .tickSize(5)
                .tickLabelFormat(insight.Formatters.dateFormatter);

            var yTime = new insight.Axis('New Apps per Month', insight.Scales.Linear)
                .tickSize(5);

            timeChart.xAxis(xTime)
                .yAxis(yTime);

            var series = new insight.LineSeries('valueLine', dates, xTime, yTime, '#336699')
                .valueFunction(function(d)
                {
                    return d.value.Count;
                })
                .showPoints(false);


            timeChart.series([series]);

            timeChart.zoomable(xTime);
            timeChart.draw();
        });
    });
