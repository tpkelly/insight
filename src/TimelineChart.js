function TimelineChart(element, key, values) {

    BaseChart.call(this, name, element, null, null);

    var self = this;

    this.values = values;
    this.key = key;

    this.dataset = function() {

        return this.values;
    };


    this.longdrag = false;

    this.drag = d3.behavior.drag()
        .on("drag", function(d, i) {
            var diff = 0;

            d3.select(this)
                .attr("y", this.y.baseVal.value + d3.event.dy)
                .attr("height", this.height.baseVal.value - d3.event.dy)
                .classed("active", true);
        })
        .on("dragend", function(d, i) {

            self.updatedEntryHandler.call(this, self.key, d, Math.round(self.y.invert(this.y.baseVal.value)));
            d3.select(this)
                .classed("active", false);
        });


    this.updatedEntryHandler = function(key, d, i) {
        self.draw();
    };

    this.newEntryHandler = function(key, d, i) {

    };

    this.clickEvent = function() {
        if (!self.longdrag) {
            var m = d3.mouse(this);
            var xPos = self.x.invert(m[0]);
            xPos = new Date(xPos.getFullYear(), xPos.getMonth(), 1, 1, 0, 0);

            var yPos = Math.round(self.y.invert(m[1]));

            self.newEntryHandler(self.key, xPos, yPos);
        }

        clearTimeout(self.timeout);
        self.longdrag = false;
    };

    this.keys = function() {
        var keys = this.dataset()
            .map(function(d) {
                return new Date(d.Date);
            });

        return keys;
    };

    this.initializeAxes = function() {

        this.x = d3.time.scale();
        this.y = d3.scale.linear();
        var max = this.findMax();
        max = max ? max + 10 : 10;

        var keys = this.keys();

        this.x.domain([new Date(2013, 0, 1), new Date(2015, 0, 1)])
            .range([0, this.xDomain()]);

        this.y
            .domain([0, max])
            .rangeRound([this.yDomain(), 0]);

        this.xAxis = d3.svg.axis()
            .scale(this.x)
            .orient("bottom")
            .tickSize(0)
            .tickPadding(6);

        this.yAxis = d3.svg.axis()
            .scale(this.y)
            .tickSize(0)
            .orient("left")
            .tickPadding(10);

        this.zoom = d3.behavior.zoom()
            .on("zoom", this.dragging);

        this.zoom.x(this.x);
    };

    this.dragging = function() {

        self.timeout = setTimeout(function() {
            self.longdrag = true;
        }, 100);

        self.draw();
    };

    this.init = function() {

        this.createChart();

        this._currentMax = this.findMax();

        this.initializeAxes();


        $.each(this.dataset(), function(i, d) {
            d.Date = new Date(d.Date);
        });

        this.chart.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.width())
            .attr("height", this.yDomain());

        this.chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (self.height() - self.margin()
                .bottom - self.margin()
                .top) + ")");

        this.chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + 0 + ",0)");

        this.chart.append("rect")
            .attr("class", "pane")
            .attr("width", this.width())
            .attr("height", this.yDomain())
            .on("click", self.clickEvent)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(this.zoom);

        this.draw();

    };


    this.draw = function() {

        var item = self.dataset();

        var max = self.findMax();

        max = max ? max + 10 : 10;
        self.y
            .domain([0, max]);

        self.chart.select("g.x.axis")
            .call(self.xAxis)
            .selectAll("text")
            .style("font-size", "12px");

        self.chart.select("g.y.axis")
            .call(self.yAxis)
            .selectAll("text")
            .style("font-size", "12px");

        var items = self.chart.selectAll("rect.item")
            .data(self.dataset())
            .enter()
            .append("rect")
            .attr("class", "item")
            .attr("fill", "#ACC3EE");

        items.append("svg:text")
            .text(this.tooltipText)
            .attr("class", "tipValue");

        items.append("svg:text")
            .text(this._tooltipLabel)
            .attr("class", "tipLabel");

        self.chart.selectAll("rect.item")
            .data(self.dataset())
            .attr("class", "item")
            .attr("y", function(d) {
                var ypos = self.y(self._valueAccessor(d));
                return ypos;
            })
            .attr("height", self.barHeight)
            .attr("x", function(d) {
                var xPos = self.x(d.Date);
                return xPos;
            })
            .attr("width", function(d) {
                var nextMonth = new Date(d.Date.getFullYear(), d.Date.getMonth() + 1, 1);

                var width = self.x(nextMonth) - self.x(d.Date);
                return width;
            })
            .on("mouseover", function(d) {
                self.mouseOver(self, this);
            })
            .on("mouseout", function(d) {
                self.mouseOut(self, this);
            })
            .attr("clip-path", "url(#clip)")
            .call(self.drag)
            .transition()
            .duration(500);

        var tips = this.chart.selectAll("text.tipValue")
            .data(this.dataset())
            .text(this.tooltipText);


    };


}


TimelineChart.prototype = Object.create(BaseChart.prototype);
TimelineChart.prototype.constructor = TimelineChart;
