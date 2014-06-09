
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


var maxRange = function (chart) {
            return d3.svg.area()
                    .x(chart.rangeX)
                    .y0(0)
                    .y1(chart.rangeY);
        };


var group = new Group(dataset);

var targets =
    {
        name: 'targets',
        label: 'Targets',
        color: '#2c3e50',
        calculation: function (d) { return d.target; },
        data: group
    };

var div = document.createElement("div");
div.id  = 'testChart';

var createChartElement = function(){
     
    document.body.appendChild(div);        
};

var removeChartElement = function(){
    document.body.removeChild(div);
};

describe("Group tests", function() {

    it("will return data in the default order", function() {
                
        var data = group.getData();

        expect(data).toBe(dataset);
    });

    it("will order data correctly, by the value property by default", function() {
                
        var data = group.getOrderedData();

        expect(data[0].key).toBe('rtert');
    });

    it("will order data correctly, using a provided ordering function", function() {
        group.orderFunction(
                function(a,b){
                    return b.target - a.target;
                }
            );
        var data = group.getOrderedData();

        expect(data[0].key).toBe('d,gj');
    });

})


describe("Base Chart Tests", function() {
    
    it("will initialize with a name", function() {
        
        var chart = new ColumnChart("Name", "asda", "asdads", "ada");

        expect(chart.displayName()).toBe("Name");

    });

});
