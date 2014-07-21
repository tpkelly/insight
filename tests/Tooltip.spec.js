

describe('Tooltip Tests', function() {
    

    it('default offset is correct', function() {
        // Given
        var tooltip = new insight.Tooltip();

        // Then
        var expectedOffset = {x: 0, y:0};
        var actualOffset = tooltip.offset();

        expect(actualOffset).toEqual(expectedOffset);

    });

    it('default styles are correct', function() {
        // Given
        var tooltip = new insight.Tooltip();

        // Then
        var expectedStyles = {
                'position': 'absolute',
                'opacity': '0',
                'top': '0',
                'pointer-events': 'none',
                'box-sizing': 'border-box'
            };
        var actualStyles = tooltip.styles();

        expect(actualStyles).toEqual(expectedStyles);

    });
    
});