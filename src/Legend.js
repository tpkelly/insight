function Legend(name, element, dimension, group)
{

    BaseChart.call(this, name, element, dimension, group);

    var self = this;

    this.dataset = function()
    {
        return this.group;
    };

    this.init = function()
    {
        var self = this;

        this.createChart();

        var legend = this.chart.selectAll(".legend")
            .data(this.dataset())
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i)
            {
                return "translate(0," + ((i * 20) + (i * 5)) + ")";
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 20)
            .attr("height", 20)
            .attr("rx", 10)
            .attr("ry", 10)
            .style("fill", function(d)
            {
                return d.color;
            });

        legend.append("text")
            .attr("x", 25)
            .attr("y", 10)
            .attr("dy", ".35em")
            .text(function(d)
            {
                return d.label;
            });

    };

    this.draw = function() {

    };
}


Legend.prototype = Object.create(BaseChart.prototype);
Legend.prototype.constructor = Legend;
