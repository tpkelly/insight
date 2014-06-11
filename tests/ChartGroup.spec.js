
var data = [
        {
            key: 'asdk',
            value: 100,
            another: 300,
            target: 500,
            maxrange: 123,
            minrange: 1
        },
        {
            key: 'ada',
            value: 120,
            another: 700,
            target: 1,
            maxrange: 123,
            minrange: 1
        },
        {
            key: 'fhfghgf',
            value: 300,
            another: 400,
            target: 300,
            maxrange: 123,
            minrange: 1
        },
        {
            key: 'rtert',
            value: 500,
            another: 5200,
            target: 150,
            maxrange: 123,
            minrange: 1
        },
        {
            key: 'd,gj',
            value: 118,
            another: 500,
            target: 1300,
            maxrange: 123,
            minrange: 1
        }
    ];



describe("ChartGroup", function() {

    it("Constructs correctly", function() {
                
        var group = new ChartGroup("Charts");

        expect(group.Name).toBe("Charts");
        expect(group.FilteredDimensions.length).toBe(0);
        expect(group.Dimensions.length).toBe(0);
        expect(group.Groups.length).toBe(0);

    });

    it("Can add a new chart", function() {
                
        var group = new ChartGroup("Charts");

        var barChart = new Chart("TestChart", "#testChart", {}, data)

        group.addChart(barChart);
        expect(group.Charts.length).toBe(1);

        group.Charts = [];        
    });
    
            

})

