
var ChartGroup = function ChartGroup(name) {
    this.Name = name;
    this.Charts = ko.observableArray();
    this.Dimensions = ko.observableArray();
    this.Groups = ko.observableArray();
    this.CumulativeGroups = ko.observableArray();
}

ChartGroup.prototype.addChart = function (chart) {

    chart.init();

    chart.filterEvent = this.chartFilterHandler.bind(this);

    this.Charts.push(chart);

    return chart;
}

ChartGroup.prototype.addDimension = function (ndx, name, func, displayFunc) {

    var dimension = new Dimension(name, ndx.dimension(func), displayFunc);

    this.Dimensions.push(dimension);

    return dimension;
}


ChartGroup.prototype.chartFilterHandler = function (data, dimension, filterValue) {

    var self = this;

    if (dimension.Filters) {

        var filterExists = dimension.Filters.indexOf(filterValue) != -1;

        //if the dimension is already filtered by this value, toggle (remove) the filter
        if (filterExists) {
            dimension.Filters.remove(filterValue)
        }
        else {
            // add the provided filter to the list for this dimension
            dimension.Filters.push(filterValue);
        }
    }

    // reset this dimension if no filters exist, else apply the filter to the dataset.
    if (dimension.Filters().length == 0) {

        dimension.Dimension.filterAll();
    }
    else {
        dimension.Dimension.filter(function (d) {
            return dimension.Filters().indexOf(d) != -1;
        });
    }

    this.CumulativeGroups().forEach(
        function (d, i) {
            var currentCount = 0;
            var renewalCount = 0;
            var budgetCount = 0;

            var data = d.getData();

            data.forEach(function (d, i) {
                currentCount += d.value.Current;
                renewalCount += d.value.Renewal;
                budgetCount += d.value.Budget;

                d.value.CurrentTotal = currentCount;
                d.value.RenewalTotal = renewalCount;
                d.value.BudgetTotal = budgetCount;
            });

        }
    );

    data.Data(data.Data());
};


ChartGroup.prototype.addSumGrouping = function (dimension, func) {
    var data = dimension.Dimension.group().reduceSum(func);
    var group = new Group(data, false);

    group.Data.subscribe(function (newValue) {
        for (var i = 0; i < this.Charts().length; i++) {
            this.Charts()[i].draw();
        }
    }, this);

    this.Groups.push(group);
    return group;
}


ChartGroup.prototype.addCumulativeGrouping = function (group) {

    group.Data.subscribe(function (newValue) {
        for (var i = 0; i < this.Charts().length; i++) {
            this.Charts()[i].draw();
        }
    }, this);


    this.Groups.push(group);

    var currentCount = 0;
    var renewalCount = 0;
    var budgetCount = 0;

    this.CumulativeGroups.push(group);

    group.getData().forEach(function (d, i) {
        currentCount += d.value.Current;
        renewalCount += d.value.Renewal;
        budgetCount += d.value.Budget;

        d.value.CurrentTotal = currentCount;
        d.value.RenewalTotal = renewalCount;
        d.value.BudgetTotal = budgetCount;
    });

}


ChartGroup.prototype.addCustomGrouping = function (group) {

    group.Data.subscribe(function (newValue) {
        for (var i = 0; i < this.Charts().length; i++) {
            this.Charts()[i].draw();
        }
    }, this);

    this.Groups.push(group);
    return group;
}
