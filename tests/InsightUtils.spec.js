

describe("InsightCharts Utils Tests", function() {
    
    it("correctly identifies arrays", function() {
        
        var data = {
            arrayProperty: ['a','b','c','d','e','f'],
            numberProperty: 1231231,
            stringProperty: "Hello!",
            objectProperty: {id:1, name:"blah"}
        };

        expect(InsightUtils.isArray(data.arrayProperty)).toBe(true);
        expect(InsightUtils.isArray(data.numberProperty)).toBe(false);
        expect(InsightUtils.isArray(data.stringProperty)).toBe(false);
        expect(InsightUtils.isArray(data.objectProperty)).toBe(false);
    });

})
