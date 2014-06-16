$(document)
    .ready(function()
    {
        d3.json('revenuereport.json', function(data)
        {

            var exampleGroup = new ChartGroup("Example Group");

            data.forEach(function(item)
            {
                item.Date = new Date(item.Date);
            });


            var ndx = new crossfilter(data);

            var date = exampleGroup.addDimension(ndx, "Date", function(d)
            {
                return d.Date;
            }, function(d)
            {
                return d.Date;
            });

            var dateData = exampleGroup.aggregate(date, function(d)
            {
                return d.CurrentRevenue;
            });

            dateData = new Grouping(date)
                .sum(['CurrentRevenue'])
                .cumulative(['CurrentRevenue.Sum'])
                .initialize();

            var chart = new Chart('Chart 1', "#chart1")
                .width(650)
                .height(350)
                .margin(
                {
                    top: 0,
                    left: 130,
                    right: 40,
                    bottom: 100
                });

            var xScale = new Scale(chart, 'Time', d3.time.scale(), 'h', 'time');
            var yScale = new Scale(chart, 'Revenue', d3.scale.linear(), 'v', 'linear');

            var line = new LineSeries('valueLine', chart, dateData, xScale, yScale, 'cyan')
                .tooltipFormat(InsightFormatters.currencyFormatter)
                .lineType('monotone')
                .yFunction(function(d)
                {
                    return d.value.CurrentRevenue.SumCumulative;
                });

            chart.series()
                .push(line);

            chart.zoomable(xScale);

            var xAxis = new Axis(chart, "x", xScale, 'bottom')
                .labelOrientation('tb')
                .tickSize(5)
                .textAnchor('start')
                .format(InsightFormatters.dateFormatter);

            var yAxis = new Axis(chart, "y", yScale, 'left')
                .tickSize(5)
                .format(InsightFormatters.currencyFormatter);

            exampleGroup.addChart(chart);

            exampleGroup.initCharts();
        });
    });
