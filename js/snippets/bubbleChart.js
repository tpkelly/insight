function createBubbleChart(chartGroup, bubbleData) {

    var bubbleChart = new insight.Chart('Bubble chart', '#bubble-chart')
        .width(300)
        .height(400);

    var xAxis = new insight.Axis('Average Rating', insight.Scales.Linear);

    var yAxis = new insight.Axis('', insight.Scales.Linear)
        .tickLabelFormat(insight.Formatters.currencyFormatter);

    bubbleChart
        .xAxis(xAxis)
        .yAxis(yAxis)
        .title('App price vs. rating vs. filesize (radius)');

    var bubbles = new insight.BubbleSeries('bubbles', bubbleData, xAxis, yAxis)
        .keyFunction(function(d) {
            return d.value.averageUserRating.Average;
        })
        .valueFunction(function(d) {
            return d.value.price.Average;
        })
        .radiusFunction(function(d) {
            return Math.sqrt(d.value.fileSizeBytes.Average);
        })
        .tooltipFunction(function(d) {
            return d.key + "\nAverage App Size (Mb) = "
                + Math.round(d.value.fileSizeBytes.Average/1024/1024);
        });

    bubbleChart.series([bubbles]);
    chartGroup.add(bubbleChart);
}
