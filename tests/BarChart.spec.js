describe("Bar Chart Tests", function() {

    var group = ko.observable();

    it("will initialize with a name", function() {
        
        var chart = new BarChart("Name", "asda", "asdads", "ada");

        expect(chart.displayName()).toBe("Name");

    });

    it("Width should be correct", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");
        chart.width(500);
        expect(chart.width()).toBe(500);
    });

    it("Height should be correct", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");
        chart.height(300);
        expect(chart.height()).toBe(300);
    });

    it("Both dimensions should be correct", function() {
        
        var chart = new BarChart("asd", "asda", "asdads", "ada");
        chart.width(200);
        chart.height(300);
        expect(chart.height()).toBe(300);
        expect(chart.width()).toBe(200);
    });


});
