var MultipleChart = function MultipleChart(name, element, dimension, group, chartGroup) {

    BaseChart.call(this, name, element, dimension, group);

    this._chartGroup = chartGroup;

    var self = this;

    this.x = d3.scale.linear();
    this.y = d3.scale.ordinal();

    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left")
        .tickSize(0)
        .tickPadding(10);

    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom")
        .tickSize(0)
        .tickPadding(10)
        .tickFormat(function(d) {
            return self.xFormatFunc(d);
        });

    this.initializeAxes = function(set) {
        this.x.domain([0, this.findMax()])
            .range([0, this.xBounds()
                .end
            ]);

        this.y.domain(this.keys())
            .rangeRoundBands([0, this.yDomain()], 0.2);
    };

    this.rowWidth = function(d) {
        return this.x(this._valueAccessor(d));
    }.bind(this);

    this.yPosition = function(d) {
        return this.y(d.key);
    }.bind(this);

    this.rowHeight = function() {
        return this.y.rangeBand();
    }.bind(this);

    this.barXPosition = function(d) {
        var x = 0;
        if (this.invert()) {
            x = this.xBounds()
                .end - this.x(this._valueAccessor(d));
        }
        return x;
    }.bind(this);


    this.subChartName = function(key) {
        return 'sub' + self._name + key.replace(/\s/g, '');
    };


    this.createChart = function() {
        this.chart = d3.select(this.element)
            .append("div")
            .attr("class", "chart multiChart");

        return this.chart;
    };

    this.subCharts = [];

    this.init = function() {
        this.createChart();

        var charts = this.chart.selectAll('div.subchart')
            .data(this.dataset());

        charts.enter()
            .append('div')
            .attr('class', 'subchart')
            .attr('id', function(d) {
                return self.subChartName(self._keyAccessor(d));
            })
            .append('div')
            .text(self._keyAccessor);

        this.dataset()
            .forEach(function(subChart) {

                var data = [];

                var k = self.dimension.Dimension.group()
                    .reduceCount()
                    .all()
                    .map(self._keyAccessor);

                k.forEach(function(d) {
                    var o = {
                        key: d
                    };

                    var value = $.grep(subChart.values, function(e) {
                        return e.key == d;
                    });


                    var val = value.length ? self._valueAccessor(value[0]) : 0;

                    o.values = val;

                    data.push(o);
                });



                var group = new SimpleGroup(data);

                var name = '#' + self.subChartName(subChart.key);


                var newChart = new RowChart(subChart.key, name, self.dimension, group, self._chartGroup)
                    .width(300)
                    .height(300)
                    .tooltipLabel(self._tooltipLabel)
                    .tooltipFormat(self._tooltipFormat)
                    .ordered(self._orderChildren)
                    .valueAccessor(function(d) {
                        return d.values;
                    })
                    .margin({
                        left: 120,
                        top: 0,
                        bottom: 0,
                        right: 0
                    });
                self.subCharts.push(newChart);
                self._chartGroup.addChart(newChart);
                newChart.init();
            });
    };

    this.draw = function() {

        var charts = this.chart.selectAll('div.subchart')
            .data(this.dataset());

        var data = this.dataset();

        this.subCharts.forEach(function(sc) {

            var subChartData = $.grep(data, function(d) {
                return d.key == sc.displayName();
            });

            subChartData = subChartData.length ? sc._valueAccessor(subChartData[0]) : [];

            sc.group.getData()
                .forEach(function(currentDataValue) {
                    var newDataValue = $.grep(subChartData, function(d) {
                        return d.key == currentDataValue.key;
                    })[0];

                    currentDataValue.values = newDataValue ? newDataValue.values : 0;
                });

        });
    };
};


MultipleChart.prototype = Object.create(BaseChart.prototype);
MultipleChart.prototype.constructor = MultipleChart;
