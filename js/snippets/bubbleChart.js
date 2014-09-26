function createBubbleChart(chartGroup, bubbleData) {

    var bubbleChart = new insight.Chart('Bubble Chart', '#bubble-chart')
        .width(300)
        .height(400);

    var xAxis = new insight.Axis('Average Rating', insight.scales.linear)
        .tickFrequency(1);

    var yAxis = new insight.Axis('', insight.scales.linear)
        .tickLabelFormat(insight.formatters.currencyFormatter);

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
            var fileSize = d.value.fileSizeBytes.Average / 1024 / 1024;
            return d.key + ": " + Math.round(fileSize) + "MB";
        });

    bubbleChart.series([bubbles]);
    chartGroup.add(bubbleChart);
}
