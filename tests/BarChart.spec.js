describe("Bar Chart Tests", function() {

    var group = ko.observable();

    it("will initialize with a name", function() {
        
        var chart = new BarChart("Name", "asda", "asdads", "ada");

        expect(chart.displayName()).toBe("Name");

    });

    it("width should be correct", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");
        chart.width(500);
        expect(chart.width()).toBe(500);
    });

    it("height should be correct", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");
        chart.height(300);
        expect(chart.height()).toBe(300);
    });

    it("both dimensions should be correct", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");
        chart.width(200);
        chart.height(300);
        expect(chart.height()).toBe(300);
        expect(chart.width()).toBe(200);
    });

    it("should have a default 0 margin", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");

        var expectedMargin = {top:0, bottom:0, left:0, right:0};
        expect(chart.margin().top).toBe(expectedMargin.top);
        expect(chart.margin().bottom).toBe(expectedMargin.bottom);
        expect(chart.margin().left).toBe(expectedMargin.left);
        expect(chart.margin().right).toBe(expectedMargin.right);
    });

    it("should correctly return a custom margin", function() {
        
        var expectedMargin = {top:100, bottom:10, left:20, right:30};

        var chart = new BarChart("asd", "asda", "asdads", "ada")
                .margin(expectedMargin);

        expect(chart.margin().top).toBe(expectedMargin.top);
        expect(chart.margin().bottom).toBe(expectedMargin.bottom);
        expect(chart.margin().left).toBe(expectedMargin.left);
        expect(chart.margin().right).toBe(expectedMargin.right);
    });

    it("should not be ordered by default", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");
        
        expect(chart.ordered()).toBe(false);
    });

    it("should be ordered if we want it to be", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada")
                .ordered(true);
        
        expect(chart.ordered()).toBe(true);
    });

    it("should return value by default", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data'};

        expect(chart._valueAccessor(item)).toBe('data');
    });

    it("should return default key", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data'};

        expect(chart._keyAccessor(item)).toBe('label');
    });

    it("should use specified value accessor", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data', alternative: 'New Value'};

        chart.valueAccessor(function(d){ return d.alternative; });

        expect(chart._valueAccessor(item)).toBe('New Value');
    });

    it("should use specified key accessor", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data', alternative: 'New Value'};

        chart.keyAccessor(function(d){ return d.alternative; });

        expect(chart._keyAccessor(item)).toBe('New Value');
    });

});
