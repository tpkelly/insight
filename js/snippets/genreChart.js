function createGenreCountChart(chartGroup, genreData){

    var chart = new insight.Chart('Genre Chart', "#genre-count")
        .width(450)
        .height(400);

    var y = new insight.Axis('', insight.Scales.Ordinal)
        .tickSize(0)
        .tickPadding(5)
        .isOrdered(true);

    var x = new insight.Axis('', insight.Scales.Linear)
        .hasReversedPosition(true)
        .tickPadding(0)
        .tickSize(0)
        .lineWidth(0)
        .lineColor('#fff');

    chart.xAxis(x)
        .yAxis(y)
        .title("Total number of Apps by genre");

    var series = new insight.RowSeries('genre', genreData, x, y)
        .valueFunction(function(d){ return d.value.Count; });

    chart.series([series]);
    chartGroup.add(chart);
}
