$(document)
    .ready(function() {

        d3.json('revenuereport.json', function(data) {

            var exampleGroup = new ChartGroup("Example Group");

            data.forEach(function(item) {
                item.Date = new Date(item.Date);
            });

            var ndx = new crossfilter(data);

            var dataset = new Group(data);

            var year = exampleGroup.addDimension(ndx, "year", function(d) {
                return d.Year;
            }, function(d) {
                return d.Year;
            });
            var office = exampleGroup.addDimension(ndx, "office", function(d) {
                return d.Office;
            }, function(d) {
                return d.Office;
            });
            var salesman = exampleGroup.addDimension(ndx, "salesman", function(d) {
                return d.FullName;
            }, function(d) {
                return d.FullName;
            });
            var date = exampleGroup.addDimension(ndx, "date", function(d) {
                return d.Date;
            }, function(d) {
                return d.Date;
            });
            var client = exampleGroup.addDimension(ndx, "Client", function(d) {
                return d.Client;
            }, function(d) {
                return d.Client;
            });

            var yearData = exampleGroup.aggregate(year, ['CurrentRevenue', 'ProjectedRevenue']);
            var officeData = exampleGroup.aggregate(office, ['CurrentRevenue', 'ProjectedRevenue']);
            var salesmanData = exampleGroup.aggregate(salesman, ['CurrentRevenue', 'ProjectedRevenue']);
            var dateData = exampleGroup.aggregate(date, ['CurrentRevenue', 'ProjectedRevenue']);
            var clientData = exampleGroup.aggregate(client, function(d) {
                    return d.ProjectedRevenue;
                })
                .cumulative(true);


            computeGroupValues(clientData);

            exampleGroup.ComputedGroups.push(clientData);
            exampleGroup.CumulativeGroups.push(clientData);

            var series = [{
                name: 'current',
                label: 'Current Revenue',
                calculation: function(d) {
                    return d.value.CurrentRevenue;
                },
                color: function(d) {
                    return '#acc3ee';
                }
            }, {
                name: 'projected',
                label: 'Projected Revenue',
                calculation: function(d) {
                    return d.value.ProjectedRevenue;
                },
                color: function(d) {
                    return '#e67e22';
                }
            }];

            var yearChart = new ColumnChart('', "#yearChart", year, yearData)
                .width(300)
                .height(360)
                .barColor('#e67e22')
                .series(series)
                .tooltipFormat(InsightFormatters.currencyFormatter)
                .yAxisFormat(InsightFormatters.currencyFormatter)
                .margin({
                    bottom: 70,
                    left: 80,
                    right: 0,
                    top: 20
                });

            var officeChart = new RowChart('', "#officeChart", office, officeData)
                .width(300)
                .height(300)
                .barColor('#2980b9')
                .valueAccessor(function(d) {
                    return d.value.CurrentRevenue
                })
                .margin({
                    bottom: 0,
                    left: 80,
                    right: 0,
                    top: 0
                });

            var personChart = new RowChart('Staff', "#personChart", salesman, salesmanData)
                .width(400)
                .height(300)
                .barColor('#2980b9')
                .valueAccessor(function(d) {
                    return d.value.CurrentRevenue
                })
                .redrawAxes(true)
                .orderable(true)
                .invert(true)
                .yOrientation('right')
                .margin({
                    bottom: 0,
                    left: 0,
                    right: 100,
                    top: 0
                });

            var pareto = new Chart('Chart 1', "#pareto")
                .width(250)
                .height(400)
                .margin({
                    top: 10,
                    left: 70,
                    right: 45,
                    bottom: 150
                });

            var x = new Scale(pareto, d3.scale.ordinal(), 'h', 'ordinal')
                .ordered(true);

            var y = new Scale(pareto, d3.scale.linear(), 'v', 'linear');
            var y2 = new Scale(pareto, d3.scale.linear(), 'v', 'linear');

            var series = new ColumnSeries('clientColumn', pareto, clientData, x, y);

            var line = new LineSeries('percentLine', pareto, clientData, x, y2, 'cyan')
                .tooltipFormat(InsightFormatters.percentageFormatter)
                .tooltipLabelFormat("Percentage")
                .yFunction(function(d) {
                    return d.Cumulative;
                });

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



            pareto.series([series, line]);

            var xAxis = new Axis(pareto, "x", x, 'bottom')
                .textAnchor('start')
                .labelOrientation('tb');

            var yAxis = new Axis(pareto, "y", y, 'left')
                .format(InsightFormatters.currencyFormatter);

            var yAxis2 = new Axis(pareto, "y2", y2, 'right')
                .format(InsightFormatters.percentageFormatter);


            var timeChart = new Chart('Chart 1', "#timeChart")
                .width(800)
                .height(350)
                .margin({
                    top: 10,
                    left: 60,
                    right: 40,
                    bottom: 100
                });

            var xTime = new Scale(timeChart, d3.time.scale(), 'h', 'time');
            var yTime = new Scale(timeChart, d3.scale.linear(), 'v', 'linear');

            var line = new LineSeries('valueLine', timeChart, dateData, xTime, yTime, 'cyan')
                .tooltipFormat(InsightFormatters.currencyFormatter)
                .lineType('monotone')
                .yFunction(function(d) {
                    return d.value.ProjectedRevenue;
                });

            timeChart.series()
                .push(line);

            timeChart.zoomable(xTime);

            var xAxis = new Axis(timeChart, "x", xTime, 'bottom')
                .labelOrientation('tb')
                .tickSize(5)
                .textAnchor('start')
                .format(InsightFormatters.dateFormatter);

            var yAxis = new Axis(timeChart, "y", yTime, 'left')
                .tickSize(5)
                .format(InsightFormatters.currencyFormatter);

            exampleGroup.addChart(yearChart);
            exampleGroup.addChart(officeChart);
            exampleGroup.addChart(personChart);
            exampleGroup.addChart(timeChart);
            exampleGroup.addChart(pareto);
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
