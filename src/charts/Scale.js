insight.Scale = function Scale(chart, title, direction, type) {
    var ordered = d3.functor(false);
    var self = this;

    this.scale = type.scale();

    this.rangeType = this.scale.rangeRoundBands ? this.scale.rangeRoundBands : this.scale.rangeRound;

    this.series = [];
    this.title = title;
    this.chart = chart;
    this.type = type;
    this.direction = direction;
    this.bounds = [];

    chart.scales()
        .push(this);

    this.domain = function() {
        if (type.name == Scales.Linear.name) {
            return [0, this.findMax()];
        } else if (type.name == Scales.Ordinal.name) {
            return this.findOrdinalValues();
        }
        if (type.name == Scales.Time.name) {
            return [this.minTime(), this.maxTime()];
        }
    };

    this.calculateBounds = function() {
        var bounds = [];

        if (self.horizontal()) {
            bounds[0] = 0;
            bounds[1] = self.chart.width() - self.chart.margin()
                .right - self.chart.margin()
                .left;
        } else if (self.vertical()) {
            bounds[0] = self.chart.height() - self.chart.margin()
                .top - self.chart.margin()
                .bottom;
            bounds[1] = 0;

        }
        return bounds;
    };

    this.minTime = function() {
        var minTime = new Date(8640000000000000);

        this.series.map(function(series) {
            var cMin = d3.min(series.keys());
            minTime = cMin < minTime ? cMin : minTime;
        });
        return minTime;
    };


    this.maxTime = function() {
        var maxTime = new Date(-8640000000000000);

        this.series.map(function(series) {
            var cMax = d3.max(series.keys());
            maxTime = cMax > maxTime ? cMax : maxTime;
        });

        return maxTime;
    };

    this.findOrdinalValues = function() {
        var vals = [];

        this.series.map(function(series) {
            vals = series.keys();
        });

        return vals;
    };

    this.horizontal = function() {
        return this.direction == 'h';
    };

    this.vertical = function() {
        return this.direction == 'v';
    };

    this.findMax = function() {
        var max = 0;

        this.series.map(function(series) {
            var m = series.findMax(self);

            max = m > max ? m : max;
        });

        return max;
    };

    this.addSeries = function(series) {
        this.series.push(series);
    };


    this.initialize = function() {
        this.applyScaleRange.call(this.scale.domain(this.domain()), this.rangeType);
    };

    this.calculateRange = function() {
        this.scale.domain(this.domain());
    };

    this.applyScaleRange = function(rangeType) {
        var bounds = self.calculateBounds();

        self.bounds = bounds;

        rangeType.apply(this, [
            bounds, self.chart.barPadding()
        ]);
    };

    this.ordered = function(_) {
        if (!arguments.length) {
            return ordered();
        }
        ordered = d3.functor(_);
        return this;
    };
};
