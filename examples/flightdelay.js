function randomRange(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document)
    .ready(function()
    {

        var data = [
        {
            x: new Date(),
            y: 20
        }];

        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Chart 1', "#chart1")
            .width(650)
            .height(350)
            .margin(
            {
                top: 0,
                left: 130,
                right: 40,
                bottom: 100
            });

        var x = new insight.Axis(chart, '', 'h', insight.Scales.Time, 'bottom')
            .tickRotation(90)
            .tickOrientation('tb')
            .labelFormat(function(d)
            {
                return d.toLocaleTimeString();
            });

        var y = new insight.Axis(chart, 'Revenue', 'v', insight.Scales.Linear, 'left');

        var line = new insight.LineSeries('valueLine', chart, dataset, x, y, '#aae')
            .valueFunction(function(d)
            {
                return d.y;
            })
            .keyFunction(function(d)
            {
                return d.x;
            })
            .points(false);

        chart.series()
            .push(line);

        insight.drawCharts();

        addData = function()
        {
            var newPoint = {
                x: new Date(),
                y: randomRange(1, 200)
            };

            data.push(newPoint);

            if (data.length > 20)
            {
                data.shift();
            }

            dataset = new insight.DataSet(data);

            insight.redrawCharts();
        };

        //setInterval(addData, 2000);
    });
