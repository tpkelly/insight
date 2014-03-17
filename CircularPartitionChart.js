

function CircularPartitionChart(name, element, dimension, group) {

    //BaseChart.call(this, element, dimension, group);
    this.element = element;
    this.group = group;

    this.margin = {
        top: 200, right: 200, bottom: 200, left: 200
    };

    var self = this;

    this.radius = Math.min(this.margin.top, this.margin.right, this.margin.bottom, this.margin.left) - 10;

    this.hue = d3.scale.category10();

    this.zoomIn = function (p) {

        if (p.depth > 1) p = p.parent;
        if (!p.children) return;

        self.zoom(p, p);
    }

    this.zoomOut = function (p) {
        if (!p.parent) return;
        self.zoom(p.parent, p);
    }

    this.luminance = d3.scale.sqrt()
        .domain([0, 1e6])
        .clamp(true)
        .range([90, 20]);

    this.svg = d3.select(this.element).append("svg")
        .attr("width", this.margin.left + this.margin.right)
        .attr("height", this.margin.top + this.margin.bottom)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.partition = d3.layout.partition()
        .sort(function (a, b) { return d3.ascending(a.key, b.key); })
        .size([2 * Math.PI, this.radius]);


    this.arc = d3.svg.arc()
        .startAngle(function (d) { return d.x; })
        .endAngle(function (d) { return d.x + d.dx - .01 / (d.depth + .5); })
        .innerRadius(function (d) { return self.radius / 4 * d.depth; })
        .outerRadius(function (d) { return self.radius / 4 * (d.depth + 1) - 1; });

    this.center = this.svg.append("circle")
            .attr("fill", "#fff")
            .attr("r", this.radius / 4)
            .on("click", this.zoomOut);

    this.init = function () {
        var self = this;
        this.partition
            .children(function (d) { return d.values; })
            .value(function (d) { return d.DayRate; })
            .nodes(self.group())
            .forEach(function (d) {
                d._children = d.children;
                d.sum = d.value;
                d.key = self.key(d);
                d.fill = self.fill(d);
            });

        // Now redefine the value function to use the previously-computed sum.
        this.partition
            .children(function (d, depth) { return depth < 2 ? d.children : null; })
            .value(function (d) { return d.value; });


        this.center.append("title")
            .text("zoom out").attr('fill', '#333');

        this.path = this.svg.selectAll("path")
            .data(this.partition.nodes(this.group()).slice(1))
          .enter().append("path")
            .attr("d", this.arc)
            .style("fill", function (d) { return d.fill; })
            .each(function (d) { this._current = self.updateArc(d); })
            .on("click", this.zoomIn);

    }


    this.key = function (d) {
        var k = [], p = d;
        while (p.depth) k.push(p.key), p = p.parent;
        return k.reverse().join(".");
    }

    this.fill = function (d) {
        var p = d;
        while (p.depth > 1) p = p.parent;
        var c = d3.lab(this.hue(p.key));
        c.l = this.luminance(d.sum);
        return c;
    }

    this.arcTween = function (b) {
        var i = d3.interpolate(this._current, b);
        this._current = i(0);
        return function (t) {
            return self.arc(i(t));
        };
    }

    this.updateArc = function (d) {
        return { depth: d.depth, x: d.x, dx: d.dx };
    }
    

    // Zoom to the specified new root.
    this.zoom = function (root, p) {
        var self = this;

        // Rescale outside angles to match the new layout.
        var enterArc,
            exitArc,
            outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

        function insideArc(d) {
            return p.key > d.key
                ? { depth: d.depth - 1, x: 0, dx: 0 } : p.key < d.key
                ? { depth: d.depth - 1, x: 2 * Math.PI, dx: 0 }
                : { depth: 0, x: 0, dx: 2 * Math.PI };
        }

        function outsideArc(d) {
            return { depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x) };
        }

        this.center.datum(root);

        // When zooming in, arcs enter from the outside and exit to the inside.
        // Entering outside arcs start from the old layout.
        if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

        self.path = self.path.data(self.partition.nodes(root).slice(1), function (d) { return d.key; });


        // When zooming out, arcs enter from the inside and exit to the outside.
        // Exiting outside arcs transition to the new layout.
        if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

        d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function () {

            self.path.exit().transition()
                .style("fill-opacity", function (d) { return d.depth === 1 + (root === p) ? 1 : 0; })
                .attrTween("d", function (d) { return self.arcTween.call(this, exitArc(d)); })
                .remove();

            self.path.enter().append("path")
                .style("fill-opacity", function (d) { return d.depth === 2 - (root === p) ? 1 : 0; })
                .style("fill", function (d) { return d.fill; })
                .on("click", self.zoomIn)
                .each(function (d) { this._current = enterArc(d); });

            self.path.transition()
                .style("fill-opacity", 1)
                .attrTween("d", function (d) { return self.arcTween.call(this, self.updateArc(d)); });
        });
    }

}

CircularPartitionChart.prototype = Object.create(BaseChart.prototype);
CircularPartitionChart.prototype.constructor = CircularPartitionChart;
