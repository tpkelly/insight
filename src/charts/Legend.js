/**
 * A Legend listing out the series on a chart
 * @class insight.Legend
 */
insight.Legend = function Legend() {

    this.draw = function(chart) {

        var series = chart.series();

        var legendHeight = 10;
        var legendWidth = 5;

        var ctx = chart.measureCanvas.getContext('2d');
        ctx.font = "12px sans-serif";

        chart.legendItems.selectAll('rect')
            .data(series)
            .enter()
            .append("rect")
            .attr("x", 5)
            .attr("y", function(item, index) {
                return index * 20 + 5;
            })
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(item) {
                return item.color();
            });

        chart.legendItems.selectAll('text')
            .data(series)
            .enter()
            .append("text")
            .attr("x", 20)
            .attr("y", function(item, index) {
                return index * 20 + 14;
            })
            .text(function(item) {
                return item.name;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", "12px")
            .attr("fill", "black");

        for (var index = 0; index < series.length; index++) {
            var seriesTextWidth = ctx.measureText(series[index].name)
                .width;
            legendHeight = index * 20 + 20;
            legendWidth = Math.max(legendWidth, seriesTextWidth + 25);
        }

        //Adjust legend to tightly wrap items
        chart.legendBox
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        chart.legendItems
            .attr("width", legendWidth)
            .attr("height", legendHeight);
    };
};
