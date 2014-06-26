
var dataset = [
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


var series = [
        {
            name: 'value',
            label: 'Value', 
            calculation: function (d) { return d.value; }, 
            color: function(d) { return '#acc3ee'; }
        },
        {
            name: 'another',
            label: 'Another',  
            calculation: function (d) { return d.another; }, 
            color: function(d) { return '#e67e22'; }
        }
    ];


var div = document.createElement("div");
div.id  = 'testChart';

var createChartElement = function(){
     
    document.body.appendChild(div);        
};

var removeChartElement = function(){
    document.body.removeChild(div);
};


describe("Base Chart Tests", function() {
    
    it("will initialize with a name", function() {
        
        var chart = new insight.Chart("asda", "asdads", "ada");

        chart.title("Test Chart");
        expect(chart.title()).toBe("Test Chart");
    });

});
