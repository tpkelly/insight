
function PieChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    this.color = d3.scale.ordinal().range(["#9ecae1", "#7CA2B6", "#77ACC9"]);

    this.filterKey = function (d) {
        return d.data.key;
    }

    this.width = 300;
    this.height = 300;

    this.arc = d3.svg.arc()
        .outerRadius(this.width / 2 - 10)
        .innerRadius(40);

    this.pie = d3.layout.pie()
                .sort(null)
                .value(function (d) { return d.value; });

    this.chart = d3.select(this.element).selectAll("svg")
                    .attr("width", this.width)
                    .attr("height", this.height)
                  .append("g")
                    .attr("transform", "translate(" + this.width() / 2 + "," + this.height() / 2 + ")");


    this.init = function () {
        var self = this;

        self.g = self.chart.selectAll(".arc")
              .data(this.pie(group().all()))
            .enter().append("g")
              .attr("class", "arc");

        self.g.append("path")
            .attr("d", function (d, i) { return self.safeArc(d, i, self.arc); })
            .style("fill", function (d) { return self.color(d.data.key); })
            .on("click", function (d) { return self.filterClick(self, this, d); })
                .on("mouseover", function (d) {
                    self.tip.show(d);
                    d3.select(this)
                        .classed("active", true);
                })
                .on("mouseout", function (d) {
                    self.tip.hide(d);
                    d3.select(this)
                        .classed("active", false);
                }).append("title").text(function (d) { return d.data.key + ": £" + d.value; })


        self.g.append("text")
          .attr("transform", function (d) { return "translate(" + self.arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .attr('fill', '#fff')
          .style("text-anchor", "middle")
          .text(function (d) { return d.data.value > 0 ? d.data.key : ""; })
    }

    this.draw = function () {

        var self = this;

        self.chart.selectAll("g.arc")
                    .data(self.pie(self.group().all()))
                    .select("path")
                        .attr("d", function (d, i) { return self.safeArc(d, i, self.arc); })
                        .style("fill", function (d) { return self.color(d.data.key); }).transition().duration(500)
                   .attrTween("d", tweenPie)

        self.chart.selectAll("g.arc path title").data(self.pie(self.group().all())).text(function (d) { return d.data.key + ": £" + d.value; })


        self.g.selectAll("text")
            .attr("transform", function (d) { return "translate(" + self.arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .attr('fill', '#fff')
          .style("text-anchor", "middle")
          .text(function (d) { return d.data.value > 0 ? d.data.key : ""; })

        function tweenPie(b) {
            b.innerRadius = 40;
            var current = this._current;
            if (isOffCanvas(current))
                current = { startAngle: 0, endAngle: 0 };
            var i = d3.interpolate(current, b);
            this._current = i(0);
            return function (t) {
                return self.safeArc(i(t), 0, self.arc);
            };
        }


        function isOffCanvas(current) {
            return !current || isNaN(current.startAngle) || isNaN(current.endAngle);
        }



    }



    this.safeArc = function (d, i, arc) {
        var path = this.arc(d, i);

        if (path.indexOf("NaN") >= 0)
            path = "M0,0";
        return path;
    }

    function sliceTooSmall(d) {
        var angle = (d.endAngle - d.startAngle);
        return isNaN(angle) || angle < 10;
    }

    function sliceHasNoData(d) {
        return d.value === 0;
    }

}

PieChart.prototype = Object.create(BaseChart.prototype);
PieChart.prototype.constructor = PieChart;
