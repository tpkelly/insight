var data = [{
    key: 'England',
    wins: 10,
    losses: 4,
    target: 5
}, {
    key: 'Scotland',
    wins: 13,
    losses: 4,
    target: 7
}, {
    key: 'Wales',
    wins: 2,
    losses: 11,
    target: 6
}, {
    key: 'Ireland',
    wins: 6,
    losses: 5,
    target: 10
}, ];

$(document)
    .ready(function() {

        var exampleGroup = new ChartGroup("Example Group");

        var dataset = new Group(data);

        var stackedSeries = [{
            name: 'wins',
            label: 'Wins',
            calculation: function(d) {
                return d.wins;
            },
            color: function(d) {
                return '#acc3ee';
            }
        }, {
            name: 'losses',
            label: 'Losses',
            calculation: function(d) {
                return d.losses;
            },
            color: function(d) {
                return '#e67e22';
            }
        }];

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
            .stacked(true)
            .series(stackedSeries);


        exampleGroup.addChart(barChart);
        exampleGroup.initCharts();


        $('#description h1')
            .css('cursor', 'pointer')
            .click(function(d) {

                barChart.stacked(!barChart.stacked());
                barChart.draw();
            });
    });
