describe('TextMeasurer', function() {

    var measurer,
        font,
        textHeight;

    function fakeDrawingContext() {
        return {
            measureText: function(text) {
                return { width: text.length };
            }
        };
    }

    beforeEach(function() {

        font = '12pt Comic Sans';
        textHeight = 2;

        var canvas = document.createElement('canvas');
        measurer = new insight.TextMeasurer(canvas);

        spyOn(insight.utils, 'getDrawingContext').andCallFake(fakeDrawingContext);

    });

    it('measures text correctly when no angle is provided', function() {

        // When
        var result = measurer.measureText('123456789', font);

        // Then
        expect(result.width).toBe(9);
        expect(result.height).toBe(textHeight);

    });

    it('measures text correctly when angle is 0', function() {

        // When
        var result = measurer.measureText('123456', font, 0);

        // Then
        expect(result.width).toBe(6);
        expect(result.height).toBe(textHeight);

    });

    it('measures text correctly when angle is 180', function() {

        // When
        var result = measurer.measureText('123', font, 180);

        // Then
        expect(result.width).toBe(3);
        expect(result.height).toBe(textHeight);

    });

    it('measures text correctly when angle is 90', function() {

        // When
        var result = measurer.measureText('12345678', font, 90);

        // Then
        expect(result.width).toBe(textHeight);
        expect(result.height).toBe(8);

    });

    it('measures text correctly for non-right-angle', function() {

        // When
        var result = measurer.measureText('12345678', font, 30);

        // Then
        expect(result.width).toBe(8);
        expect(result.height).toBe(6);

    });

});