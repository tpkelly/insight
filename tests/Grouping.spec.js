var dataset = 
[{"Id":1,"Forename":"Martin","Surname":"Watkins","Country":"Scotland","DisplayColour":"#38d33c","Age":1,"IQ":69, "Interests":["Ballet", "Music", "Climbing"], "Gender":'Male'},
{"Id":2,"Forename":"Teresa","Surname":"Knight","Country":"Scotland","DisplayColour":"#6ee688","Age":20,"IQ":103, "Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":3,"Forename":"Mary","Surname":"Lee","Country":"Wales","DisplayColour":"#8e6bc2","Age":3,"IQ":96,"Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":4,"Forename":"Sandra","Surname":"Harrison","Country":"Northern Ireland","DisplayColour":"#02acd0","Age":16,"IQ":55, "Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":5,"Forename":"Frank","Surname":"Cox","Country":"England","DisplayColour":"#0b281c","Age":5,"IQ":105,"Interests":["Football", "Music", "Kayaking"], "Gender":'Male'},
{"Id":6,"Forename":"Mary","Surname":"Jenkins","Country":"England","DisplayColour":"#5908e3","Age":19,"IQ":69,"Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":7,"Forename":"Earl","Surname":"Stone","Country":"Wales","DisplayColour":"#672542","Age":6,"IQ":60,"Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Male'},
{"Id":8,"Forename":"Ashley","Surname":"Carr","Country":"England","DisplayColour":"#f9874f","Age":18,"IQ":63,"Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":9,"Forename":"Judy","Surname":"Mcdonald","Country":"Northern Ireland","DisplayColour":"#3ab1a8","Age":2,"IQ":70,"Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":10,"Forename":"Earl","Surname":"Flores","Country":"England","DisplayColour":"#1be47c","Age":20,"IQ":93,"Interests":["Climbing", "Boxing"], "Gender":'Male'},
{"Id":11,"Forename":"Terry","Surname":"Wheeler","Country":"Wales","DisplayColour":"#2cd57b","Age":4,"IQ":87,"Interests":["Climbing", "Boxing"], "Gender":'Male'},
{"Id":12,"Forename":"Willie","Surname":"Reid","Country":"Northern Ireland","DisplayColour":"#7fcf1e","Age":7,"IQ":86,"Interests":["Climbing", "Boxing"], "Gender":'Male'},
{"Id":13,"Forename":"Deborah","Surname":"Palmer","Country":"Northern Ireland","DisplayColour":"#9fd1d5","Age":5,"IQ":85,"Interests":["Climbing", "Boxing"], "Gender":'Female'},
{"Id":14,"Forename":"Annie","Surname":"Jordan","Country":"England","DisplayColour":"#8f4fd1","Age":10,"IQ":100, "Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":15,"Forename":"Craig","Surname":"Gibson","Country":"England","DisplayColour":"#111ab4","Age":7,"IQ":106,"Interests":["Football", "Music", "Kayaking"], "Gender":'Male'},
{"Id":16,"Forename":"Lisa","Surname":"Parker","Country":"England","DisplayColour":"#52d5cf","Age":18,"IQ":53,"Interests":["Football", "Music", "Kayaking"], "Gender":'Female'},
{"Id":17,"Forename":"Samuel","Surname":"Willis","Country":"Wales","DisplayColour":"#e2f6cc","Age":11,"IQ":98, "Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":18,"Forename":"Lisa","Surname":"Chapman","Country":"Northern Ireland","DisplayColour":"#1c5829","Age":7,"IQ":51, "Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'},
{"Id":19,"Forename":"Ryan","Surname":"Freeman","Country":"Scotland","DisplayColour":"#6cbc04","Age":12,"IQ":96, "Interests":["Football", "Music", "Kayaking"], "Gender":'Male'},
{"Id":20,"Forename":"Frances","Surname":"Lawson","Country":"Northern Ireland","DisplayColour":"#e739c9","Age":14,"IQ":71, "Interests":["Triathlon", "Music", "Mountain Biking"], "Gender":'Female'}];


var chartGroup = new ChartGroup('Testing');

describe("Grouping tests", function() {

    it("will initialize without error", function() {
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension);

        var data = group.getData();
        
        expect(data.length).toBe(4);
    });

    it("will correctly sum a property", function() {
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension);
        
        group.sum(['IQ']);

        var data = group.getData();
        
        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];
        var england = data.filter(function(country){ return country.key=='England'; })[0];
        
        expect(scotland.value.IQ.Sum).toBe(268);
        expect(england.value.IQ.Sum).toBe(589);
    });

    it("will correctly average a property", function() {
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension);
        
        group.sum(['IQ']);

        var data = group.getData();
        
        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];
        var england = data.filter(function(country){ return country.key=='England'; })[0];
        
        expect(scotland.value.IQ.Sum).toBe(268);
        expect(england.value.IQ.Sum).toBe(589);
    });


    it("will order data correctly, using the count by default", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension)
                                        .ordered(true);
        
        var data = group.getOrderedData();
        
        expect(data[0].key).toBe('England');
        expect(data[data.length-1].key).toBe('Scotland');

    });


    it("will order data correctly, using a provided ordering function", function() {

        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension)
                                        .ordered(true);
        
        var data = group.getOrderedData();
        
        expect(data[0].key).toBe('England');
        expect(data[data.length-1].key).toBe('Scotland');

    });

    
    it("will calculate a cumulative property", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'age', function(d){return d.Age;}, function(d){return d.Age;});
        
        var group = new Grouping(dimension)
                        .mean(['IQ'])
                        .cumulative(['IQ.Sum','IQ.Average']);

        var data = group.getData();

        
        expect(data[data.length-1].value.IQ.AverageCumulative).toBe(1203);
        expect(data[data.length-1].value.IQ.SumCumulative).toBe(1616);

        
    });
    
    it("will correctly count the values in an value property", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension)
                            .count(["Gender"]);

        var data = group.getData();

        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Gender["Male"]).toBe(2);
        expect(scotland.value.Gender["Female"]).toBe(1);
        
    });


    it("will correctly count the values in an array property", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        
        var group = new Grouping(dimension)
                            .count(["Interests"]);

        var data = group.getData();

        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Interests.Ballet).toBe(1);
        expect(scotland.value.Interests.Music).toBe(3);
        expect(scotland.value.Interests.Total).toBe(9);
        
    });



    it("will update the count after a dimensional filter", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'country', function(d){return d.Country;}, function(d){return d.Country;});
        var age =  chartGroup.addDimension(ndx, 'age', function(d){return d.Age;}, function(d){return d.Age;});
        
        var group = new Grouping(dimension)
                            .count(["Gender", "Interests"]);

        var data = group.getData();

        var scotland = data.filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Gender["Male"]).toBe(2);
        expect(scotland.value.Gender["Female"]).toBe(1);
        expect(scotland.value.Interests.Ballet).toBe(1);
        expect(scotland.value.Interests.Music).toBe(3);
        expect(scotland.value.Interests.Total).toBe(9);

        //filter age by people older than 10, to remove an entry from the scotland group and hopefully trigger a recalculation of the property counts
        age.Dimension.filter(function(d){
            return d > 10;
        });

        scotland = group.getData().filter(function(country){ return country.key=='Scotland'; })[0];

        expect(scotland.value.Gender["Male"]).toBe(1);
        expect(scotland.value.Gender["Female"]).toBe(1);
        expect(scotland.value.Interests.Triathlon).toBe(1);
        expect(scotland.value.Interests.Music).toBe(2);
        expect(scotland.value.Interests.Total).toBe(6);
    });


    it("will correctly aggregate a multi dimension", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'interests', function(d){return d.Interests;}, null, true);
        var ages =  chartGroup.addDimension(ndx, 'ages', function(d){return d.Age;}, null, false);
        
        var group = new Grouping(dimension).count(["Interests"]);

        var data = group.getData();

        var ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        var triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(1);
        expect(triathlon.value).toBe(11);        

        ages.Dimension.filter(function(d){ 
            return d > 10; 
        });

        var data = group.getData();

        ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(0);
        expect(triathlon.value).toBe(6);        

    });



    it("will correctly aggregate a sorted multi dimension", function() {
        
        var ndx = crossfilter(dataset);

        var dimension =  chartGroup.addDimension(ndx, 'interests', function(d){return d.Interests;}, null, true);
        var ages =  chartGroup.addDimension(ndx, 'ages', function(d){return d.Age;}, null, false);
        
        var group = new Grouping(dimension).count(["Interests"]);

        var data = group.getOrderedData();

        var ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        var triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(1);
        expect(triathlon.value).toBe(11);        

        var current = data[0].value;

        data.forEach(function(d){
            expect(d.value <= current).toBe(true);
            current = d.value;
        });

        ages.Dimension.filter(function(d){ 
            return d > 10; 
        });

        data = group.getOrderedData();
        
        ballet = group.getData().filter(function(a){ return a.key=='Ballet'; })[0];
        triathlon = group.getData().filter(function(a){ return a.key=='Triathlon'; })[0];

        expect(ballet.value).toBe(0);
        expect(triathlon.value).toBe(6);        

        var current = data[0].value;

        data.forEach(function(d){
            expect(d.value <= current).toBe(true);
            current = d.value;
        });

    });

})

