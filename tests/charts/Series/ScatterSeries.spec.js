/**
 * Created by nsoper on 09/07/2014.
 */

describe('ScatterSeries', function() {

    var series;

    beforeEach(function() {

        var data = [{x:0, y:0},
                    {x:5, y:3},
                    {x:3, y:5}];

        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Scatter Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis('', insight.scales.linear);
        var yAxis = new insight.Axis('', insight.scales.linear);
        chart.addXAxis(xAxis);
        chart.addYAxis(yAxis);

        series = new insight.ScatterSeries('ScatterSeries', dataset, xAxis, yAxis);
        chart.series([series]);

    });

    it('Radius of all points defaults to 3', function () {

        //When:
        var scatterData = series.pointData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        });

        expect(radii).toEqual([3, 3, 3]);
    });

    it('Radius of all points can be set', function () {
        //Given:
        series.pointRadius(7);

        //When:
        var scatterData = series.pointData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        });

        expect(radii).toEqual([7, 7, 7]);
    });

    it('pointRadius of 0 gives zero radius to points', function () {
        //Given:
        series.pointRadius(0);

        //When:
        var scatterData = series.pointData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        });

        expect(radii).toEqual([0, 0, 0]);
    });

    it('negative pointRadius gives zero radius to points', function () {
        //Given:
        series.pointRadius(-1);

        //When:
        var scatterData = series.pointData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        });

        expect(radii).toEqual([0, 0, 0]);
    });

    it('Sets x from data', function () {
        
        //When:
        var scatterData = series.pointData(series.dataset());

        //Then:
        var xValues = scatterData.map(function(d) {
            return d.x;
        });

        expect(xValues).toEqual([0, 5, 3]);
    });

    it('Sets y from data', function () {
        
        //When:
        var scatterData = series.pointData(series.dataset());

        //Then:
        var yValues = scatterData.map(function(d) {
            return d.y;
        });

        expect(yValues).toEqual([0, 3, 5]);
    });

    describe('findMax', function() {

        var xAxis,
            yAxis,
            series;

        var testData = [
            { size: 120, price: 13 },
            { size: 123, price: 87 },
            { size: 1120, price: 763 },
            { size: 13, price: 24 },
            { size: 1, price: 46 },
            { size: 8, price: 999 },
        ];

        beforeEach(function() {

            xAxis = new insight.Axis('x', insight.scales.linear);
            yAxis = new insight.Axis('y', insight.scales.linear);

            series = new insight.ScatterSeries('bubbles', testData, xAxis, yAxis)
                .keyFunction(function(d) {
                    return d.size;
                })
                .valueFunction(function(d) {
                    return d.price;
                });

        });

        it('returns maximum value on x-axis', function() {

            // When
            var result = series.findMax(xAxis);

            // Then
            expect(result).toBe(1120);

        });

        it('returns maximum value on y-axis', function() {

            // When
            var result = series.findMax(yAxis);

            // Then
            expect(result).toBe(999);

        });

    });

});