$(document)
    .ready(function() {
        d3.json('revenuereport.json', function(data) {

            var exampleGroup = new ChartGroup("Example Group");

            var ndx = new crossfilter(data);

            var client = exampleGroup.addDimension(ndx, "Client", function(d) {
                return d.Client;
            }, function(d) {
                return d.Client;
            });

            var clientData = exampleGroup.aggregate(client, function(d) {
                    return d.CurrentRevenue;
                })
                .cumulative(true);


            computeGroupValues(clientData);

            var chart = new Chart('Chart 1', "#chart1")
                .width(250)
                .height(400)
                .margin({
                    top: 10,
                    left: 70,
                    right: 45,
                    bottom: 150
                });

            var x = new Scale(chart, d3.scale.ordinal(), 'h', 'ordinal')
                .ordered(true);

            var y = new Scale(chart, d3.scale.linear(), 'v', 'linear');
            var y2 = new Scale(chart, d3.scale.linear(), 'v', 'linear');

            var series = new ColumnSeries('clientColumn', chart, clientData, x, y);

            var line = new LineSeries('percentLine', chart, clientData, x, y2, 'cyan')
                .tooltipFormat(InsightFormatters.percentageFormatter)
                .tooltipLabelFormat("Percentage");

            series.series = [{
                name: 'value',
                accessor: function(d) {
                    return d.value;
                },
                label: 'Value',
                color: '#e67e22',
                tooltipValue: function(d) {
                    return InsightFormatters.currencyFormatter(d.value);
                }
            }];

            line.valueAccessor = function(d) {
                return d.Cumulative;
            };


            chart.series([series, line]);

            var xAxis = new Axis(chart, "x", x, 'bottom')
                .textAnchor('start')
                .labelOrientation('tb');

            var yAxis = new Axis(chart, "y", y, 'left')
                .format(InsightFormatters.currencyFormatter);

            var yAxis2 = new Axis(chart, "y2", y2, 'right')
                .format(InsightFormatters.percentageFormatter);


            exampleGroup.addChart(chart);

            exampleGroup.initCharts();
        });
    });


function computeGroupValues(group) {
    var aggregateFunction = function() {

        var self = this;
        var total = 0;

        this.getData()
            .forEach(function(d) {
                total += d.value;
            });

        this.getData()
            .forEach(function(d) {
                d.Percentage = d.value / total;
            });

    }.bind(group);

    group.computeFunction(aggregateFunction)
        .valueAccessor(function(d) {
            return d.Percentage;
        })

    group.compute();
    group.calculateTotals();
}
