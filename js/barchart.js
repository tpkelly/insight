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

        var barChart = new BarChart('', "#exampleChart", {}, dataset)
            .width(640)
            .height(400)
            .margin({
                top: 20,
                left: 50,
                bottom: 80,
                right: 0
            })
            .barColor('#ACC3EE')
            .tooltipLabel('Blah');


        exampleGroup.addChart(barChart);
        exampleGroup.initCharts();

    });
