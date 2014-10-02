$(document)
    .ready(function()
    {

        var populationData = [
        {
            "country": "England",
            "population": 53012456
        },
        {
            "country": "Scotland",
            "population": 5295000
        },
        {
            "country": "Wales",
            "population": 3063456
        },
        {
            "country": "Northern Ireland",
            "population": 1810863
        }];

        var chart = new insight.Chart('Population', "#population")
            .width(500)
            .height(400);

        var x = new insight.Axis('Country', insight.scales.ordinal)
            .title('')
            .textAnchor('middle');

        var y = new insight.Axis('Population', insight.scales.linear)
            .title('Population')
            .tickLabelFormat(function(tickValue)
            {
                var millions = tickValue / 1000000;
                return millions + 'M';
            })
            .shouldShowGridlines(true);

        chart.xAxis(x);
        chart.yAxis(y);

        var populations = new insight.ColumnSeries('Population', populationData, x, y)
            .keyFunction(function(d)
            {
                return d.country;
            })
            .valueFunction(function(d)
            {
                return d.population;
            })
            .tooltipFormat(insight.formatters.numberFormatter);

        chart.series([populations]);

        chart.draw();

    });
