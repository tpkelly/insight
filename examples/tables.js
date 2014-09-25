$(document)
    .ready(function()
    {

        var populationData = [
        {
            "country": "England",
            "population": 53012456
        },
        {
            "country": "Scotland",
            "population": 5295000
        },
        {
            "country": "Wales",
            "population": 3063456
        },
        {
            "country": "Northern Ireland",
            "population": 1810863
        }];

        var dataSet = new insight.DataSet(populationData);
        var group = dataSet.group("countries", function(d)
            {
                return d.country;
            })
            .mean(["population"]);

        var table = new insight.Table('stats', '#population', group)
            .columns([
            {
                label: 'Population',
                value: function(d)
                {
                    return d.value.population.Average;
                }
            }]);

        table.draw();
    });
