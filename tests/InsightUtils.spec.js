

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


    it('calculates the bounding box of an SVG element', function() {
        
        // Given
        var svg = document.createElement('svg');
        svg.id  = 'svg';
        svg.style = 'width:400px; height:300px';

        var rect = document.createElement('rect');
        rect.setAttribute('x','100');
        rect.setAttribute('y','50');
        rect.setAttribute('width','20');
        rect.setAttribute('height','150');
        
        svg.appendChild(rect);
        document.body.appendChild(svg);
        
        // Then
        
        

    });

})

