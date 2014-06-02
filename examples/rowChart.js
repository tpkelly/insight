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

        var rowChart = new RowChart('', "#exampleChart", {}, dataset)
            .width(600)
            .height(200)
            .margin({
                left: 60,
                bottom: 0,
                top: 0,
                right: 0
            })
            .barColor('#ACC3EE')
            .yOrientation('left')
            .tooltipLabel('Value');

        var invertedRowChart = new RowChart('', "#exampleChart", {}, dataset)
            .width(600)
            .height(200)
            .margin({
                left: 0,
                bottom: 0,
                top: 0,
                right: 60
            })
            .invert(true)
            .barColor('#ACC3EE')
            .yOrientation('right')
            .tooltipLabel('Value');


        exampleGroup.addChart(rowChart);
        exampleGroup.addChart(invertedRowChart);
        exampleGroup.initCharts();

    });
