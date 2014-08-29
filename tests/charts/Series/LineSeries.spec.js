describe('LineSeries', function() {

    describe('findMax', function() {

        var xAxis,
            yAxis,
            series;

        var testData = [
            { size: 120, price: 13 },
            { size: 123, price: 87 },
            { size: 50, price: 763 },
            { size: 13, price: 24 },
            { size: 1, price: 46 },
            { size: 8, price: 0 },
        ];

        beforeEach(function() {

            xAxis = new insight.Axis('x', insight.Scales.Linear);
            yAxis = new insight.Axis('y', insight.Scales.Linear);

            series = new insight.LineSeries('bubbles', testData, xAxis, yAxis)
                .keyFunction(function(d) {
                    return d.price;
                })
                .valueFunction(function(d) {
                    return d.size;
                });

        });

        it('returns maximum value on x-axis', function() {

            // When
            var result = series.findMax(xAxis);

            // Then
            expect(result).toBe(763);

        });

        it('returns maximum value on y-axis', function() {

            // When
            var result = series.findMax(yAxis);

            // Then
            expect(result).toBe(123);

        });

    });

});