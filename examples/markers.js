var data = [
{
    key: 'England',
    value: 53012456,
    target: 64012456
},
{
    key: 'Scotland',
    value: 5295000,
    target: 13195000
},
{
    key: 'Wales',
    value: 3063456,
    target: 43076456
},
{
    key: 'Northern Ireland',
    value: 1810863,
    target: 9012456
}];

$(document)
    .ready(function()
    {
        var dataset = new insight.DataSet(data);

        var x = new insight.Axis('Country', insight.Scales.Ordinal)
            .tickLabelRotation(45)
            .tickSize(5);

        var y = new insight.Axis('Population', insight.Scales.Linear)
            .tickLabelFormat(d3.format("0,000"));

        var chart = new insight.Chart('Chart 1', "#exampleChart")
            .width(450)
            .height(400)
            .legend(new insight.Legend());

        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('countries', dataset, x, y, 'silver')
            .valueFunction(function(d)
            {
                return d.value;
            });


        var targets = new insight.MarkerSeries('targets', dataset, x, y, '#333')
            .valueFunction(function(d)
            {
                return d.target;
            })
            .widthFactor(0.3);

        chart.series([series, targets]);

        chart.draw();
    });
