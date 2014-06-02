var data = [{
    key: 'England',
    min: 1,
    average: 10,
    max: 4,
    value: 3
}, {
    key: 'Scotland',
    min: 1,
    average: 13,
    max: 4,
    value: 1
}, {
    key: 'Wales',
    min: 2,
    average: 2,
    max: 11,
    value: 4
}, {
    key: 'Ireland',
    min: 1,
    average: 6,
    max: 5,
    value: 9
}, ];


$(document)
    .ready(function() {

        var exampleGroup = new ChartGroup("Example Group");

        var dataset = new Group(data);

        var minRange = function(chart) {
            return d3.svg.area()
                .x(chart.rangeX)
                .y0(chart.rangeY)
                .y1(chart.yDomain);
        };

        var maxRange = function(chart) {
            return d3.svg.area()
                .x(chart.rangeX)
                .y0(0)
                .y1(chart.rangeY);
        };

        var averageRange = function(chart) {
            return d3.svg.line()
                .x(function(d) {
                    return chart.rangeX(d) + (chart.barWidth() / 2);
                })
                .y(chart.rangeY);
        };

        var ranges = [{
            name: 'min',
            label: 'Minimum',
            position: InsightConstants.Behind,
            color: 'silver',
            calculation: function(d) {
                return d.min;
            },
            type: minRange,
            class: 'minrange'
        }, {
            name: 'max',
            label: 'Maximum',
            color: '#CDE5E1',
            position: InsightConstants.Behind,
            calculation: function(d) {
                return d.max;
            },
            type: maxRange,
            class: 'maxrange'
        }, {
            name: 'target',
            label: 'Target',
            color: 'green',
            position: InsightConstants.Front,
            calculation: function(d) {
                return d.average;
            },
            type: averageRange,
            class: 'linetarget'
        }];



        var barChart = new ColumnChart('', "#exampleChart", {}, dataset)
            .width(640)
            .height(400)
            .margin({
                top: 20,
                left: 50,
                bottom: 80,
                right: 0
            })
            .ranges(ranges)
            .valueAccessor(function(d) {
                return d.value;
            })
            .barColor('#555');



        exampleGroup.addChart(barChart);
        exampleGroup.initCharts();

        $('.linetarget')
            .css('fill', 'none')
            .css('stroke', '#888');
    });
