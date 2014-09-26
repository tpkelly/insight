describe('MarkerSeries', function() {

    describe('findMax', function() {

        var xAxis,
            yAxis,
            series;

        var testData = [
            { strength: 5, intelligence: 123 },
            { strength: 6, intelligence: 56 },
            { strength: 9, intelligence: 28 },
            { strength: 2, intelligence: 90 }
        ];

        beforeEach(function() {

            xAxis = new insight.Axis('x', insight.scales.linear);
            yAxis = new insight.Axis('y', insight.scales.linear);

            series = new insight.MarkerSeries('columns', testData, xAxis, yAxis)
                .keyFunction(function(d) {
                    return d.strength;
                })
                .valueFunction(function(d) {
                    return d.intelligence;
                });

        });

        it('returns maximum value on x-axis', function() {

            // When
            var result = series.findMax(xAxis);

            // Then
            expect(result).toBe(9);

        });

        it('returns maximum value on y-axis', function() {

            // When
            var result = series.findMax(yAxis);

            // Then
            expect(result).toBe(123);

        });

    });

});