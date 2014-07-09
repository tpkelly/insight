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

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear);
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear);

        series = new insight.ScatterSeries('ScatterSeries', chart, dataset, xAxis, yAxis, 'silver');
        chart.series([series]);

    });

    it('Radius of all points defaults to 3', function () {

        //When:
        var scatterData = series.scatterData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        })

        expect(radii).toEqual([3, 3, 3]);
    });

    it('Radius of all points can be set', function () {
        //Given:
        series.pointRadius(7);

        //When:
        var scatterData = series.scatterData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        })

        expect(radii).toEqual([7, 7, 7]);
    });

    it('Sets x from data', function () {
        
        //When:
        var scatterData = series.scatterData(series.dataset());

        //Then:
        var xValues = scatterData.map(function(d) {
            return d.x;
        })

        expect(xValues).toEqual([0, 5, 3]);
    });

    it('Sets y from data', function () {
        
        //When:
        var scatterData = series.scatterData(series.dataset());

        //Then:
        var yValues = scatterData.map(function(d) {
            return d.y;
        })

        expect(yValues).toEqual([0, 3, 5]);
    });

});