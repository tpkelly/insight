var data = [{
    key: 'England',
    value: 10
}, {
    key: 'Scotland',
    value: 20
}, {
    key: 'Wales',
    value: 13
}, {
    key: 'Ireland',
    value: 15
}];

$(document)
    .ready(function() {

        var exampleGroup = new ChartGroup("Example Group");

        var dataset = new Group(data);

        var barChart = new ColumnChart('', "#exampleChart", {}, dataset)
            .width(640)
            .height(400)
            .margin({
                top: 20,
                left: 50,
                bottom: 80,
                right: 0
            })
            .tickSize(5)
            .barColor('#ACC3EE')
            .tooltipLabel('Value');


        exampleGroup.addChart(barChart);
        exampleGroup.initCharts();

        barChart.chart.selectAll("line.horizontalGrid").data([2,6,14]).enter()
            .append("line")
                .attr(
                {
                    "class":"horizontalGrid",
                    "x1" : barChart.margin().right,
                    "x2" : barChart.width(),
                    "y1" : function(d){ return barChart.y(d);},
                    "y2" : function(d){ return barChart.y(d);},
                    "fill" : "none",
                    "shape-rendering" : "crispEdges",
                    "stroke" : "silver",
                    "stroke-width" : "1px"
                });
        
    });
