/**
 * Created by tkelly on 03/07/2014.
 */

describe('Bubble Series Tests', function() {

    it('Points with same radius have radius greater than 0', function () {
        //Given:
        var data = [{x:0, y:0, radius:2},
                    {x:5, y:3, radius:2},
                    {x:3, y:5, radius:2}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Bubble Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear);
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear);

        var series = new insight.BubbleSeries('BubbleSeries', chart, dataset, xAxis, yAxis, 'silver')
            .radiusFunction(function(d) {
                return d.radius;
            });
        chart.series([series]);

        //When:
        var bubbleData = series.bubbleData(series.dataset());

        //Then:
        var radii = bubbleData.map(function(d) {
            return d.radius;
        })

        // Max pixel radius = 25 (width:250 / 10)
        // Radius = 25 (max pixel radius) * 2 (current radius) / 2 (max radius in set)
        expect(radii).toEqual([25, 25, 25]);
    });

    it('Points with 0 radius have radius of 0', function () {
        //Given:
        var data = [{x:0, y:0, radius:0},
                    {x:5, y:3, radius:0},
                    {x:3, y:5, radius:0}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Bubble Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear);
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear);

        var series = new insight.BubbleSeries('BubbleSeries', chart, dataset, xAxis, yAxis, 'silver')
            .radiusFunction(function(d) {
                return d.radius;
            });
        chart.series([series]);

        //When:
        var bubbleData = series.bubbleData(series.dataset());

        //Then:
        var radii = bubbleData.map(function(d) {
            return d.radius;
        })
        expect(radii).toEqual([0, 0, 0]);
    });

    it('Points with different radius have proportional radii', function () {
        //Given:
        var data = [{x:0, y:0, radius:5},
                    {x:5, y:3, radius:1},
                    {x:3, y:5, radius:2}];
        var dataset = new insight.DataSet(data);

        var chart = new insight.Chart('Bubble Chart', '#chart')
            .width(250)
            .height(250);

        var xAxis = new insight.Axis(chart, '', 'h', insight.Scales.Linear);
        var yAxis = new insight.Axis(chart, '', 'v', insight.Scales.Linear);

        var series = new insight.BubbleSeries('BubbleSeries', chart, dataset, xAxis, yAxis, 'silver')
            .radiusFunction(function(d) {
                return d.radius;
            });
        chart.series([series]);

        //When:
        var bubbleData = series.bubbleData(series.dataset());

        //Then:
        var radii = bubbleData.map(function(d) {
            return d.radius;
        })

        //Largest is 25px, the rest are proportional to the size of the largest
        //Also returned in descending order, to display the smallest points on top.
        expect(radii).toEqual([25, 10, 5]);
    });
});