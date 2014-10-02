$(document)
    .ready(function()
    {
        d3.json('datasets/world_countries.json', function(countryData)
        {

            var countriesWithRegions = countryData.filter(function(country)
            {
                return country.region && (country.region.length > 0);
            });

            var dataset = new insight.DataSet(countriesWithRegions);
            var worldCountriesByRegion = dataset.group(
                    'regions',
                    function(country)
                    {
                        return country.region;
                    })
                .sum(['area']);

            var table = new insight.Table('stats', '#regions', worldCountriesByRegion)
                .columns([
                {
                    label: 'Total area (km<sup>2</sup>)',
                    value: function(d)
                    {
                        var floored = Math.floor(d.value.area.Sum);
                        var formatted = insight.formatters.numberFormatter(floored);

                        return formatted;
                    }
                }])
                .descending(function(region)
                {
                    return region.value.area.Sum;
                });

            table.draw();

        });
    });
