function CountChart(name, element, dimension, group) {

    BaseChart.call(this, name, element, dimension, group);

    this.filter = new Date().getMonth();

    this.init = function() {
        var self = this;

        d3.select(this.element).selectAll("div")
            .data(this.dataset())
            .enter()
            .append("div")
            .attr("class", "counter")
            .html(function(d) {
                return d.key;
            })
            .append("span")
            .html(function(d) {
                var label = d.value > 0 ? "£" : "";
                return label + d.value;
            });
    };

    this.draw = function() {
        var self = this;

        d3.select(this.element).selectAll(".counter")
            .data(this.dataset())
            .html(function(d) {
                return d.key;
            })
            .append("span")
            .html(function(d) {
                var label = d.value > 0 ? "£" : "";
                return label + d.value;
            })
            .transition().duration(500);
    };
}


CountChart.prototype = Object.create(BaseChart.prototype);
CountChart.prototype.constructor = CountChart;
