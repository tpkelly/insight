
function DataTable(element, dimension, group) {
    BaseChart.call(this, element, dimension, group);

    var self = this;

    this._columns = [];

    this.chart = d3.select(this.element).append("table")
            .attr("class", "dataTable")

    this.columns = function (c) {
        if (!arguments.length) { return this._columns; }
        this._columns = c;
        return this;

    };

    this.init = function () {
        var self = this;

        this.header = this.chart.append("thead").append("tr");
        this.header.selectAll("th").data(this._columns).enter().append("th").html(function (d) { return d; })

        this.rows = this.chart.selectAll("tr.datarow")
                        .data(this.dimension.dimension.top(50).filter(this._limitFunction));

        this.rows.enter()
                 .append("tr")
                 .attr("class", "datarow")

        this.cells = this.rows.selectAll("td")
                    .data(function (row) {

                        return self._columns.map(function (column) {
                            return { column: column, value: row[column] };
                        })
                    });

        this.cells.enter()
                  .append("td");

        this.cells.html(function (d) { return d.value; })
    }

    this.draw = function () {
        var self = this;

        this.rows = this.chart.selectAll("tr.datarow")
                        .data(this.dimension.dimension.top(50).filter(this._limitFunction))
        this.rows.enter()
                 .append("tr")
                .attr("class", "datarow")

        this.cells = this.rows.selectAll("td")
                    .data(function (row) {
                        return self._columns.map(function (column) {
                            return { column: column, value: row[column] };
                        })
                    });

        this.cells.enter()
                  .append("td");

        this.cells.html(function (d) { return d.value; })

        this.cells.exit().remove();

        this.rows.exit().remove();
    }
}

DataTable.prototype = Object.create(BaseChart.prototype);
DataTable.prototype.constructor = DataTable;
