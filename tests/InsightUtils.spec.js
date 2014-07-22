

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

})
