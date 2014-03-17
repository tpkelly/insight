
function TimeLine(element, dimension, group) {

    this.element = element;
    this.group = group;
    this.dimension = dimension;
    var self = this;

    this.w = 400;
    this.h = 500;

    this.chart = d3.select(this.element)
                    .append("svg")
                    .attr("width", this.w)
                    .attr("height", "100%")
                    .attr("class", "timelineChart")

    this.maxRange = d3.max(this.group().all()).value;

    this.range = [this.dimension.bottom(1)[0].Date, this.dimension.top(1)[0].Date];

    this.x = d3.scale.linear()
                .domain([0, this.maxRange])
                .range([0, this.w - 160]);

    this.y = d3.time.scale()
                .domain(this.range)
                .range([0, this.h]);


    this.yAxis = d3.svg.axis().scale(this.y).tickSize(0).orient("right");

    this.mini = this.chart.append("g")
                    .attr("width", this.w)
                    .attr("height", this.h)
                    .attr("y", 10)
                    .attr("class", "mini")

    this.brush = d3.svg.brush()
                    .y(this.y)
                    .on("brush", function () { self.display(); });


    this.display = function () {

        var self = this;

        var minExtent = self.brush.extent()[0],
            maxExtent = self.brush.extent()[1];

        if (minExtent.getTime() != maxExtent.getTime()) {
            this.dimension.filter(function (d) { return d >= minExtent && d <= maxExtent });

            self.mini.select(".brush")
                .call(self.brush.extent([minExtent, maxExtent]));
        }
        else {
            this.dimension.filterAll();
        }

        this.group(this.group());
    }


    this.draw = function () {
        var self = this;


        //mini item rects
        self.chart.selectAll(".mini rect")
            .data(this.group().all())
            .transition().duration(500)
            .attr("y", function (d) { return self.y(d.key); })
            .attr("width", function (d) { return self.x(d.value); });

    }


    this.init = function () {
        var self = this;

        //mini item rects
        self.mini.append("g").selectAll("miniItems")
            .data(this.group().all())
            .enter().append("rect")
            .attr("x", 60)
            .attr("y", function (d) { return self.y(d.key); })
            .attr("width", function (d) { return self.x(d.value); })
            .attr("height", 3)

        self.mini.append("g")
          .attr("class", "y axis")

          .style("font-size", "11px")
          .call(self.yAxis);

        self.mini.append("g")
            .attr("class", "x brush")
            .call(self.brush)
            .selectAll("rect")
            .attr("width", self.w);
    }

}


TimeLine.prototype = Object.create(BaseChart.prototype);
TimeLine.prototype.constructor = TimeLine;



