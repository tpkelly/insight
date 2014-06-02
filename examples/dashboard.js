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

            var yearData = exampleGroup.aggregate(year, ['CurrentRevenue', 'ProjectedRevenue']);
            var officeData = exampleGroup.aggregate(office, ['CurrentRevenue', 'ProjectedRevenue']);
            var salesmanData = exampleGroup.aggregate(salesman, ['CurrentRevenue', 'ProjectedRevenue']);
            var dateData = exampleGroup.aggregate(date, ['CurrentRevenue', 'ProjectedRevenue']);


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
                .yAxisFormat(function(d) {
                    return d.split(" ")[0];
                })
                .invert(true)
                .yOrientation('right')
                .margin({
                    bottom: 0,
                    left: 0,
                    right: 80,
                    top: 0
                });



            exampleGroup.addChart(yearChart);
            exampleGroup.addChart(officeChart);
            exampleGroup.addChart(personChart);
            exampleGroup.initCharts();
        });
    });
