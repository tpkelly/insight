
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

var ranges = [
       {
           name: 'min',
           label: 'Minimum',
           color: 'silver',
           position: 'behind',
           calculation: function (d) { return d.minrange; },
           type: maxRange
       },
       {
           name: 'max',
           label: 'Maximum',
           color: 'silver',
           position: 'behind',
           calculation: function (d) { return d.maxrange; },
           type: maxRange
       }
   ];

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

    it("width should be correct", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");
        chart.width(500);
        expect(chart.width()).toBe(500);
    });

    it("height should be correct", function() {
        
        var chart = new ColumnChart("#asd", "asda", "asdads", "ada");
        chart.height(300);
        expect(chart.height()).toBe(300);
    });

    it("default tick padding is 10", function(){

        createChartElement();

        var chart = new ColumnChart("testChart", "#testChart", null, group);
        
        chart.init();
        
        expect(chart.tickPadding()).toBe(10);
    });


    it("custom tick padding works correctly", function(){

        createChartElement();

        var chart = new ColumnChart("testChart", "#testChart", null, group);
        
        chart.tickPadding(15);

        chart.init();
        
        expect(chart.tickPadding()).toBe(15);
    });

    it("default tick size is 0", function(){

        createChartElement();

        var chart = new ColumnChart("testChart", "#testChart", null, group);
        
        chart.init();

        expect(chart.tickSize()).toBe(0);
    });

    it("settings tick size works correctly", function(){

        createChartElement();

        var chart = new ColumnChart("testChart", "#testChart", null, group);
        chart.tickSize(5);
        
        chart.init();

        expect(chart.tickSize()).toBe(5);
    });


    it("bar width for single series is correct", function() {
        
        createChartElement();

        var chart = new ColumnChart("testChart", "#testChart", null, group);

        chart.width(100);
        chart.barPadding(0);

        chart.init();

        var calculatedBarWidth = chart.barWidth(dataset[0]);

        expect(calculatedBarWidth).toBe(20);

        removeChartElement();
    });

    it("bar width for two series is correctly half of the group width", function() {
        
        createChartElement();

        var chart = new ColumnChart("testChart", "#testChart", null, group)
                        .series(series);

        chart.width(100);
        chart.barPadding(0);

        chart.init();

        var dataPoint = dataset[0];

        var calculatedBarWidth = chart.barWidth(dataPoint);
        var groupedBarWidth = chart.groupedBarWidth(dataPoint);

        expect(calculatedBarWidth).toBe(20);
        expect(groupedBarWidth).toBe(10);

        removeChartElement();
    });


    it("both dimensions should be correct", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");
        chart.width(200);
        chart.height(300);
        expect(chart.height()).toBe(300);
        expect(chart.width()).toBe(200);
    });

    it("should have a default 0 margin", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");

        var expectedMargin = {top:0, bottom:0, left:0, right:0};
        expect(chart.margin().top).toBe(expectedMargin.top);
        expect(chart.margin().bottom).toBe(expectedMargin.bottom);
        expect(chart.margin().left).toBe(expectedMargin.left);
        expect(chart.margin().right).toBe(expectedMargin.right);
    });

    it("isFunction works with a function", function() {
        
        var chart = new ColumnChart("Name", "asda", "asdads", "ada");

        expect(chart.isFunction(function(f){ return f;})).toBe(true);

    });

    it("isFunction works with a non function object", function() {
        
        var chart = new ColumnChart("Name", "asda", "asdads", "ada");

        expect(chart.isFunction({h:"hello"})).toBe(false);

    });

    it("isFunction works with a primitive", function() {
        
        var chart = new ColumnChart("Name", "asda", "asdads", "ada");

        expect(chart.isFunction("hello")).toBe(false);

    });

    it("bar colour can be set with string", function() {
        
        var chart = new ColumnChart("Name", "asda", "asdads", "ada")
                            .barColor('blue');

        expect(chart.calculateBarColor()).toBe('blue');
    });

    it("multiple charts allow specific properties", function() {
        
        var chart = new ColumnChart("Name", "asda", "asdads", "ada")
                            .barColor('blue');

        var chart2 = new ColumnChart("Name", "asda", "asdads", "ada")
                            .barColor('red');

        expect(chart.calculateBarColor()).toBe('blue');
        expect(chart2.calculateBarColor()).toBe('red');
    });

    it("bar colour can be set with a function", function() {
        
        var colorFunc = function(d){
            var c = d % 2 ? 'red' : 'black';
            return c;
        };

        var chart = new ColumnChart("Name", "asda", "asdads", "ada")
                            .barColor(colorFunc);

        expect(chart.calculateBarColor(1)).toBe('red');
        expect(chart.calculateBarColor(0)).toBe('black');
    });


    it("should correctly return a custom margin", function() {
        
        var expectedMargin = {top:100, bottom:10, left:20, right:30};

        var chart = new ColumnChart("asd", "asda", "asdads", "ada")
                .margin(expectedMargin);

        expect(chart.margin().top).toBe(expectedMargin.top);
        expect(chart.margin().bottom).toBe(expectedMargin.bottom);
        expect(chart.margin().left).toBe(expectedMargin.left);
        expect(chart.margin().right).toBe(expectedMargin.right);
    });

    it("should not be ordered by default", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");
        
        expect(chart.ordered()).toBe(false);
    });

    it("should be ordered if we want it to be", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada")
                .ordered(true);
        
        expect(chart.ordered()).toBe(true);
    });

    it("should return value by default", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data'};

        expect(chart._valueAccessor(item)).toBe('data');
    });

    it("should return default key", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data'};

        expect(chart._keyAccessor(item)).toBe('label');
    });

    it("should use specified value accessor", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data', alternative: 'New Value'};

        chart.valueAccessor(function(d){ return d.alternative; });

        expect(chart._valueAccessor(item)).toBe('New Value');
    });

    it("should use specified key accessor", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");

        var item = {key: 'label', value: 'data', alternative: 'New Value'};

        chart.keyAccessor(function(d){ return d.alternative; });

        expect(chart._keyAccessor(item)).toBe('New Value');
    });

    it("should be non-cumulative by default", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");

        expect(chart.cumulative()).toBe(false);
    });

    it("should be cumulative when we want it to be", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada")
                .cumulative(true);
    });


    it("default x axis should be ordinal", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");
        chart.x.domain(["a", "b", "c"]).rangeBands([0,3]);
        var actual = chart.x("c");
        expect(actual).toBe(2);

        var actual = chart.x("b");
        expect(actual).toBe(1);
    });

    it("should allow time scales on the x axis", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada")
                            .setXAxis(d3.time.scale());
        
        var start = new Date(2013,0,1);
        var end = new Date(2014,0,1);

        chart.x.domain([start, end]).range([0,400]);

        var start = chart.x(start);
        var end = chart.x(end);

        expect(end).toBe(400);
        expect(start).toBe(0);
    });

    it("time scaled x axis should work correctly", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada")
                            .setXAxis(d3.time.scale());
        
        var start = new Date(2013,0,1);
        var end = new Date(2014,0,1);

        chart.x.domain([start, end]).range([0,400]);

        var start = chart.x(start);
        var end = chart.x(end);

        expect(end).toBe(400);
        expect(start).toBe(0);
    });

    it("should be zoomable", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", "ada");
                            
        chart.zoomable(true);

        expect(chart.zoomable()).toBe(true);
    });

    it("can calculate maximum of single series", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", group);

        expect(chart.findMax()).toBe(500);
    });

    it("can calculate maximum of single series with a target series from the same dataset", function() {
        
        
        var chart = new ColumnChart("asd", "asda", "asdads", group).targets(targets);

        expect(chart.findMax()).toBe(1300);
    });

    it("can calculate maximum when using a stacked series", function() {
        
        var chart = new ColumnChart("asd", "asda", "asdads", group)
                        .series(series)
                        .targets(targets);

        expect(chart.findMax()).toBe(5700);
    });

    it("can calculate maximum when using ranges, when range isn't largest value", function() {
        
        var maxRange = function (chart) {
                return d3.svg.area()
                        .x(chart.rangeX)
                        .y0(0)
                        .y1(chart.rangeY);
            };


        var chart = new ColumnChart("asd", "asda", "asdads", group)
                        .series(series)
                        .ranges(ranges)
                        .targets(targets);

        expect(chart.findMax()).toBe(5700);
    });
    
    it("can calculate maximum when using ranges, when range is largest value", function() {
        
        var newItem = {
            key: 'ada',
            value: 120,
            another: 700,
            target: 1,
            maxrange: 12300,
            minrange: 1
        }

        dataset.push(newItem);


       var chart = new ColumnChart("asd", "asda", "asdads", group)
                        .series(series)
                        .ranges(ranges)
                        .targets(targets);



       expect(chart.findMax()).toBe(12300);
       
       dataset.splice(dataset.indexOf(newItem), 1);
    });

});
