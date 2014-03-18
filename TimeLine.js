
function TimeLine(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    

    this.maxRange = d3.max(this.dataset()).value;

    this.range = [this.dimension.Dimension.bottom(1)[0].Date, this.dimension.Dimension.top(1)[0].Date];

    
    this.initializeAxes = function () {
        this.x = d3.scale.linear()
                .domain([0, this.maxRange])
                .range([0, this.width() - 160]);

        this.y = d3.time.scale()
                    .domain(this.range)
                    .range([0, this.height()]);

        this.yAxis = d3.svg.axis().scale(this.y).tickSize(0).orient("right");

    }

    this.display = function () {

        var self = this;

        var minExtent = self.brush.extent()[0],
            maxExtent = self.brush.extent()[1];

        if (minExtent.getTime() != maxExtent.getTime()) {
            this.dimension.Dimension.filter(function (d) { return d >= minExtent && d <= maxExtent });

            self.mini.select(".brush")
                .call(self.brush.extent([minExtent, maxExtent]));
        }
        else {
            this.dimension.Dimension.filterAll();
        }
        var g = this.group.Data();

        this.group.Data(this.group.Data());
    }


    this.init = function () {
        var self = this;
        this.createChart();
        this.initializeAxes();

        this.mini = this.chart.append("g")
                    .attr("width", function () {
                        var w = self.width();
                        return self.width();
                    })
                    .attr("height", function () { return self.height(); })
                    .attr("y", 10)
                    .attr("class", "mini")

        this.brush = d3.svg.brush()
                    .y(this.y)
                    .on("brush", function () { self.display(); });



        //mini item rects
        self.mini.append("g").selectAll("miniItems")
            .data(this.dataset())
            .enter().append("rect")
            .attr("x", 60)
            .attr("y", function (d) {
                return self.y(d.key);
            })
            .attr("width", function (d) {
                return self.x(d.value);
            })
            .attr("height", 3)

        self.mini.append("g")
          .attr("class", "y axis")

          .style("font-size", "11px")
          .call(self.yAxis);

        self.mini.append("g")
            .attr("class", "x brush")
            .call(self.brush)
            .selectAll("rect")
            .attr("width", self.width());
    }



    this.draw = function () {
        var self = this;


        //mini item rects
        self.chart.selectAll(".mini rect")
            .data(this.dataset())
            .transition().duration(500)
            .attr("y", function (d) { return self.y(d.key); })
            .attr("width", function (d) { return self.x(d.value); });

    }


}


TimeLine.prototype = Object.create(BaseChart.prototype);
TimeLine.prototype.constructor = TimeLine;



