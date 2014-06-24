var dataset = [
{
    "Id": 1,
    "Forename": "Martin",
    "Surname": "Watkins",
    "Country": "Scotland",
    "DisplayColour": "#38d33c",
    "Age": 1,
    "IQ": 69,
    "Interests": ["Ballet", "Music", "Climbing"],
    "Gender": 'Male'
},
{
    "Id": 2,
    "Forename": "Teresa",
    "Surname": "Knight",
    "Country": "Scotland",
    "DisplayColour": "#6ee688",
    "Age": 20,
    "IQ": 103,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 3,
    "Forename": "Mary",
    "Surname": "Lee",
    "Country": "Wales",
    "DisplayColour": "#8e6bc2",
    "Age": 3,
    "IQ": 96,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 4,
    "Forename": "Sandra",
    "Surname": "Harrison",
    "Country": "Northern Ireland",
    "DisplayColour": "#02acd0",
    "Age": 16,
    "IQ": 55,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 5,
    "Forename": "Frank",
    "Surname": "Cox",
    "Country": "England",
    "DisplayColour": "#0b281c",
    "Age": 5,
    "IQ": 105,
    "Interests": ["Football", "Music", "Kayaking"],
    "Gender": 'Male'
},
{
    "Id": 6,
    "Forename": "Mary",
    "Surname": "Jenkins",
    "Country": "England",
    "DisplayColour": "#5908e3",
    "Age": 19,
    "IQ": 69,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 7,
    "Forename": "Earl",
    "Surname": "Stone",
    "Country": "Wales",
    "DisplayColour": "#672542",
    "Age": 6,
    "IQ": 60,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Male'
},
{
    "Id": 8,
    "Forename": "Ashley",
    "Surname": "Carr",
    "Country": "England",
    "DisplayColour": "#f9874f",
    "Age": 18,
    "IQ": 63,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 9,
    "Forename": "Judy",
    "Surname": "Mcdonald",
    "Country": "Northern Ireland",
    "DisplayColour": "#3ab1a8",
    "Age": 2,
    "IQ": 70,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 10,
    "Forename": "Earl",
    "Surname": "Flores",
    "Country": "England",
    "DisplayColour": "#1be47c",
    "Age": 20,
    "IQ": 93,
    "Interests": ["Climbing", "Boxing"],
    "Gender": 'Male'
},
{
    "Id": 11,
    "Forename": "Terry",
    "Surname": "Wheeler",
    "Country": "Wales",
    "DisplayColour": "#2cd57b",
    "Age": 4,
    "IQ": 87,
    "Interests": ["Climbing", "Boxing"],
    "Gender": 'Male'
},
{
    "Id": 12,
    "Forename": "Willie",
    "Surname": "Reid",
    "Country": "Northern Ireland",
    "DisplayColour": "#7fcf1e",
    "Age": 7,
    "IQ": 86,
    "Interests": ["Climbing", "Boxing"],
    "Gender": 'Male'
},
{
    "Id": 13,
    "Forename": "Deborah",
    "Surname": "Palmer",
    "Country": "Northern Ireland",
    "DisplayColour": "#9fd1d5",
    "Age": 5,
    "IQ": 85,
    "Interests": ["Climbing", "Boxing"],
    "Gender": 'Female'
},
{
    "Id": 14,
    "Forename": "Annie",
    "Surname": "Jordan",
    "Country": "England",
    "DisplayColour": "#8f4fd1",
    "Age": 10,
    "IQ": 100,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 15,
    "Forename": "Craig",
    "Surname": "Gibson",
    "Country": "England",
    "DisplayColour": "#111ab4",
    "Age": 7,
    "IQ": 106,
    "Interests": ["Football", "Music", "Kayaking"],
    "Gender": 'Male'
},
{
    "Id": 16,
    "Forename": "Lisa",
    "Surname": "Parker",
    "Country": "England",
    "DisplayColour": "#52d5cf",
    "Age": 18,
    "IQ": 53,
    "Interests": ["Football", "Music", "Kayaking"],
    "Gender": 'Female'
},
{
    "Id": 17,
    "Forename": "Samuel",
    "Surname": "Willis",
    "Country": "Wales",
    "DisplayColour": "#e2f6cc",
    "Age": 11,
    "IQ": 98,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 18,
    "Forename": "Lisa",
    "Surname": "Chapman",
    "Country": "Northern Ireland",
    "DisplayColour": "#1c5829",
    "Age": 7,
    "IQ": 51,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
},
{
    "Id": 19,
    "Forename": "Ryan",
    "Surname": "Freeman",
    "Country": "Scotland",
    "DisplayColour": "#6cbc04",
    "Age": 12,
    "IQ": 96,
    "Interests": ["Football", "Music", "Kayaking"],
    "Gender": 'Male'
},
{
    "Id": 20,
    "Forename": "Frances",
    "Surname": "Lawson",
    "Country": "Northern Ireland",
    "DisplayColour": "#e739c9",
    "Age": 14,
    "IQ": 71,
    "Interests": ["Triathlon", "Music", "Mountain Biking"],
    "Gender": 'Female'
}];


$(document)
    .ready(function()
    {

        var exampleGroup = new ChartGroup("Example Group");

        var ndx = crossfilter(dataset);

        var country = exampleGroup.addDimension(ndx, 'country', function(d)
        {
            return d.Country;
        }, function(d)
        {
            return d.Country;
        });

        var interests = exampleGroup.addDimension(ndx, 'interests', function(d)
            {
                return d.Interests;
            }, function(d)
            {
                return d.Interests;
            },
            true
        );

        var countries = new Grouping(country);
        var interestsData = new Grouping(interests)
            .count(["Interests"]);

        exampleGroup.addGroup(countries);
        exampleGroup.addGroup(interestsData);

        var chart = new Chart('Chart 1', "#genreCount", country)
            .width(450)
            .height(400)
            .margin(
            {
                top: 10,
                left: 50,
                right: 40,
                bottom: 120
            });

        var x = new Scale(chart, 'Country', d3.scale.ordinal(), 'h', 'ordinal');
        var y = new Scale(chart, 'Count', d3.scale.linear(), 'v', 'linear');

        var series = new ColumnSeries('countryColumn', chart, countries, x, y, 'silver')
            .yFunction(function(d)
            {
                return d.value.Count;
            });

        chart.series([series]);

        var xAxis = new Axis(chart, "x", x, 'bottom')
            .labelOrientation('tb');

        var yAxis = new Axis(chart, "y", y, 'left')
            .format(d3.format("0,000"));


        var chart2 = new Chart('Chart 2', "#languages", interests)
            .width(450)
            .height(400)
            .margin(
            {
                top: 10,
                left: 60,
                right: 40,
                bottom: 120
            });

        var x2 = new Scale(chart2, 'Interest', d3.scale.ordinal(), 'h', 'ordinal');
        var y2 = new Scale(chart2, 'Count', d3.scale.linear(), 'v', 'linear');

        var series2 = new ColumnSeries('interests', chart2, interestsData, x2, y2, 'silver')
            .yFunction(function(d)
            {
                return d.value;
            });

        chart2.series([series2]);

        var xAxis2 = new Axis(chart2, "x", x2, 'bottom')
            .labelOrientation('tb');

        var yAxis2 = new Axis(chart2, "y", y2, 'left')
            .format(d3.format("0,000"));


        exampleGroup.addChart(chart);
        exampleGroup.addChart(chart2);

        exampleGroup.initCharts();
    });
