function createLanguageChart(chartGroup, languages){

    var chart = new insight.Chart('Language Chart', '#languages')
        .width(350)
        .height(400);

    var x = new insight.Axis('Language', insight.scales.ordinal)
        .isOrdered(true);

    var y = new insight.Axis('', insight.scales.linear);

    chart.xAxis(x)
        .yAxis(y)
        .title("Total number of Apps by language");

    var lSeries = new insight.ColumnSeries('languages', languages, x, y)
        .top(10);

    chart.series([lSeries]);
    chartGroup.add(chart);
}
