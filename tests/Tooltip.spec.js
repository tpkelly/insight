var createElement = function(namespace, tag) {
    return document.createElementNS(namespace, tag);
}

var htmlNamespace = 'http://www.w3.org/1999/xhtml';
var svgNamespace = 'http://www.w3.org/2000/svg';

describe('Tooltip Tests', function() {
    

    it('default offset is correct', function() {
        // Given
        var tooltip = new insight.Tooltip();

        // Then
        var expectedOffset = {x: 0, y:0};
        var actualOffset = tooltip.offset();

        expect(actualOffset).toEqual(expectedOffset);

    });

    it('custom offset setter works', function() {
        // Given
        var tooltip = new insight.Tooltip();

        // When 

        tooltip.offset({x:0, y:-10});

        // Then
        var expectedOffset = {x: 0, y:-10};
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
    

    it('container setter works', function() {
        // Given
        var tooltip = new insight.Tooltip();
        
        var div = createElement(htmlNamespace, 'div' );
                        
        document.body.appendChild(div);

        // When

        tooltip.container(div);

        // Expect

        expect(tooltip.container()).toEqual(div);

        // Tidy up
        div.parentNode.removeChild(div);
    });


    it('tooltip is drawn in correct location', function() {
        
        // Given
        var tooltip = new insight.Tooltip();
        var text = "Hello";

        var container = createElement(htmlNamespace, 'div' );
        var svg = createElement(svgNamespace, 'svg');
        var rect = createElement(svgNamespace, 'rect');
        rect.setAttribute('x','100');
        rect.setAttribute('y','50');
        rect.setAttribute('width','20');
        rect.setAttribute('height','150');

        container.appendChild(svg);
        svg.appendChild(rect);
        document.body.appendChild(container);

        // When
        tooltip.container(container);
        tooltip.show(rect, text);

        // Expect
        
        var expectedLeft = "94px";
        var expectedTop = "30px";
        
        var actualLeft = tooltip.element.style.left;
        var actualTop = tooltip.element.style.top;

        expect(actualLeft).toEqual(expectedLeft);
        expect(actualTop).toEqual(expectedTop);
        
        // Tidy up
        container.parentNode.removeChild(container);
    });


});