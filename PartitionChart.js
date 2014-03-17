

function PartitionChart(name, element, dimension, group) {

    this.element = element;
    this.group = group;

    var w = 1120,
    h = 600,
    x = d3.scale.linear().range([0, w]),
    y = d3.scale.linear().range([0, h]);

    this.vis = d3.select(this.element).append("div")
        .attr("class", "chart")
        .style("width", w + "px")
        .style("height", h + "px")
      .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    this.partition = d3.layout.partition()
        .children(function (d) { return d.values; })
        .value(function (d) { return d.ProjectedRevenue; });

    this.init = function () {

        var self = this;

        var g = this.vis.selectAll("g")
          .data(self.partition.nodes(this.group()))
        .enter().append("svg:g")
          .attr("transform", function (d) {
              return "translate(" + x(d.y) + "," + y(d.x) + ")";
          })
          .on("click", click);

        var kx = w / this.group().dx,
        ky = h / 1;

        g.append("svg:rect")
            .attr("width", this.group().dy * kx)
            .attr("height", function (d) { return d.dx * ky; })
            .attr("class", function (d) { return d.children ? "parent" : "child"; })
            .attr('fill', 'rgb(135, 158, 192)')
            .style('stroke', '#fff');


        g.append("svg:text")
            .attr("transform", transform)
            .attr("dy", ".35em")
            .attr("dx", "2em")
            .attr("fill", "#ecf0f1")
            .style("font-size", "13px")
            .style("opacity", function (d) { return d.dx * ky > 12 ? 1 : 0; })
            .text(function (d) { return d.key; });


        function transform(d) {
            return "translate(8," + d.dx * ky / 2 + ")";
        }

        function click(d) {
            if (!d.children) return;

            kx = (d.y ? w - 40 : w) / (1 - d.y);
            ky = h / d.dx;
            x.domain([d.y, 1]).range([d.y ? 40 : 0, w]);
            y.domain([d.x, d.x + d.dx]);

            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function (d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function (d) { return d.dx * ky; });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function (d) { return d.dx * ky > 12 ? 1 : 0; });

            d3.event.stopPropagation();
        }
    }
}

PartitionChart.prototype = Object.create(BaseChart.prototype);
PartitionChart.prototype.constructor = PartitionChart;
