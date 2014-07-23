

var createElement = function(namespace, tag) {
    return document.createElementNS(namespace, tag);
}



describe('InsightCharts Utils Tests', function() {
    
    it('correctly identifies arrays', function() {
        
        var data = {
            arrayProperty: ['a','b','c','d','e','f'],
            numberProperty: 1231231,
            stringProperty: 'Hello!',
            objectProperty: {id:1, name:'blah'}
        };

        expect(insight.Utils.isArray(data.arrayProperty)).toBe(true);
        expect(insight.Utils.isArray(data.numberProperty)).toBe(false);
        expect(insight.Utils.isArray(data.stringProperty)).toBe(false);
        expect(insight.Utils.isArray(data.objectProperty)).toBe(false);
    });

    it('combines two arrays, removing duplicates', function() {
        
        // Given
        var firstArray = ['a','b','c','d','e','f'];
        var secondArray = ['c','d','e','f', 'g', 'h', 'i'];
        
        var combinedArray = firstArray.concat(secondArray);

        // Then

        var expectedResult = ['a','b','c','d','e','f','g','h','i'];
        var actualResult = insight.Utils.arrayUnique(combinedArray);

        expect(actualResult).toEqual(expectedResult);
    });

    it('can calculate a dimensional slice', function(){
        // Given 

        var input = { key: 'Scotland', value: 100 };

        // Then

        var expectedResult = 'in_Scotland';
        var actualResult = insight.Utils.keySelector(input);

        expect(actualResult).toBe(expectedResult);
    });

    it('unions two objects, prioritizing the first', function() {
        
        // Given
        var base =  {'font': 'arial', 'display':'block'};
        var extension = {'font-size': '17px', 'display': 'inline'};
        
        
        // Then

        var expectedResult = {'font': 'arial', 'display':'block', 'font-size': '17px'};
        var actualResult = insight.Utils.objectUnion(base, extension);

        expect(actualResult).toEqual(expectedResult);
    });

    it('unions two objects, if second is empty', function() {
        
        // Given
        var base =  {'font': 'arial', 'display':'block'};
        var extension = {};
        
        
        // Then

        var expectedResult = {'font': 'arial', 'display':'block'};
        var actualResult = insight.Utils.objectUnion(base, extension);

        expect(actualResult).toEqual(expectedResult);
    });


    it('calculates the north point of an SVG element', function() {
        
        // Given
        var svg = createElement('http://www.w3.org/2000/svg', 'svg' );
        svg.id  = 'svg';
        svg.style = 'width:400px; height:300px';

        var rect = createElement('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x','100');
        rect.setAttribute('y','50');
        rect.setAttribute('width','20');
        rect.setAttribute('height','150');
                
        svg.appendChild(rect);
        document.body.appendChild(svg);
        // When
        
        var boundingBox = insight.Utils.getSVGBoundingBox(rect);

        // Then
        
        var expectedNorthX = 110;
        var expectedNorthY = 50;

        var actualNorthX = boundingBox.n.x;
        var actualNorthY = boundingBox.n.y;

        expect(actualNorthY).toEqual(expectedNorthY);
        expect(expectedNorthX).toEqual(expectedNorthX);


        // Tidy up

        document.body.removeChild(svg);
    });

})

