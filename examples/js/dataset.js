var data = [
    {key: 'England', vote: 'Yes', value: 10}, 
    {key: 'England', vote: 'No', value: 5}, 
    {key: 'Scotland', vote: 'Yes', value: 20}, 
    {key: 'Scotland', vote: 'No', value: 2}, 
    {key: 'Wales', vote: 'Yes', value: 13}, 
    {key: 'Wales', vote: 'No', value: 24}, 
    {key: 'Ireland', vote: 'Yes', value: 15},
    {key: 'Ireland', vote: 'No', value: 17}
];

var voteColours = {'yes': '#d35400', 'no': '#3498db'};

$(document).ready(function(){

    var exampleGroup = new ChartGroup("Example Group");

    var ndx = crossfilter(data);

    var countryFunc = function(d){return d.key;};
    var voteFunc = function(d){return d.vote;};
    var valueFunc = function(d){return d.value;};
    
    var countryDimension = exampleGroup.addDimension(ndx, "country", countryFunc, countryFunc);
    var voteDimension = exampleGroup.addDimension(ndx, "vote", voteFunc, voteFunc);

    var countryGrouping = exampleGroup.addSumGrouping(countryDimension, valueFunc)
    var voteGrouping = exampleGroup.addSumGrouping(voteDimension, valueFunc)
    
    var colourFunc = function(d){ 
        var colour = d.key == 'Yes' ? '#33ce74' : '#d35400';
        return colour; 
    }

    var barChart = new BarChart('a', "#exampleChart", countryDimension, countryGrouping)
                    .width(300)
                    .height(300)
                    .margin({ top: 20, left: 50, bottom: 80, right: 0 })
                    .barColor('#ACC3EE')
                    .tooltipLabel('Blah');
    
    var voteChart = new BarChart('s', "#voteChart", voteDimension, voteGrouping)
                    .width(300)
                    .height(300)
                    .margin({ top: 20, left: 50, bottom: 80, right: 0 })
                    .barColor(colourFunc)
                    .tooltipLabel('Blah');


    exampleGroup.addChart(barChart);
    exampleGroup.addChart(voteChart);
    exampleGroup.initCharts();
    
    $('.exampleChart').css('display', 'inline-block');
});
