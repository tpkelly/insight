function createBubbleChart(chartGroup, bubbleData) {

    var bubbleChart = new insight.Chart('Bubble chart', '#bubble-chart')
        .width(300)
        .height(400);

    var bubbleX = new insight.Axis('Average Rating', insight.Scales.Linear)
        .tickSize(5)
        .tickPadding(5);

    bubbleX.ticksHint = d3.functor(4);

    var bubbleY = new insight.Axis('', insight.Scales.Linear)
        .tickSize(5)
        .tickPadding(5)
        .tickLabelFormat(insight.Formatters.currencyFormatter);

    bubbleChart
        .xAxis(bubbleX)
        .yAxis(bubbleY)
        .title('App price vs. rating vs. filesize (radius)');

    var bubbles = new insight.BubbleSeries('bubbles', bubbleData, bubbleX, bubbleY)
        .keyFunction(function(d)
        {
            return d.value.averageUserRating.Average;
        })
        .valueFunction(function(d)
        {
            return d.value.price.Average;
        })
        .radiusFunction(function(d)
        {
            return Math.sqrt(d.value.fileSizeBytes.Average);
        })
        .tooltipFunction(function(d)
        {
            return d.key + " <br/> Average App Size (Mb) = " + Math.round(d.value.fileSizeBytes.Average/1024/1024);
        });

    bubbleChart.series([bubbles]);
    chartGroup.add(bubbleChart);

}
