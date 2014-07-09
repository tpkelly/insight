/**
 * Created by nsoper on 09/07/2014.
 */

describe('ScatterSeries', function() {

    it('Radius of all points defaults to 1', function () {
        //Given:
        var data = [{x:0, y:0},
                    {x:5, y:3},
                    {x:3, y:5}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Scatter Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear);
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear);

        var series = new insight.ScatterSeries('ScatterSeries', chart, dataset, xAxis, yAxis, 'silver');
        chart.series([series]);

        //When:
        var scatterData = series.scatterData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        })

        expect(radii).toEqual([1, 1, 1]);
    });

    it('Radius of all points can be set', function () {
        //Given:
        var data = [{x:0, y:0},
                    {x:5, y:3},
                    {x:3, y:5}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Scatter Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear);
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear);

        var series = new insight.ScatterSeries('ScatterSeries', chart, dataset, xAxis, yAxis, 'silver')
            .pointRadius(7);

        chart.series([series]);

        //When:
        var scatterData = series.scatterData(series.dataset());

        //Then:
        var radii = scatterData.map(function(d) {
            return d.radius;
        })

        expect(radii).toEqual([7, 7, 7]);
    });

});