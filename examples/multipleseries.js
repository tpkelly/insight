$(document)
    .ready(function()
    {
        var leaguePlaces = [
        {
            teamName: 'Chuffed FC',
            currentPosition: 5,
            targetPoints: 50,
            currentPoints: 18
        },
        {
            teamName: 'Old Boys',
            currentPosition: 3,
            targetPoints: 45,
            currentPoints: 27
        },
        {
            teamName: 'Hairy Harriers',
            currentPosition: 1,
            targetPoints: 90,
            currentPoints: 35
        },
        {
            teamName: 'Kings Arms',
            currentPosition: 2,
            targetPoints: 40,
            currentPoints: 34
        },
        {
            teamName: 'YMCA Athletic',
            currentPosition: 6,
            targetPoints: 35,
            currentPoints: 18
        },
        {
            teamName: 'Wasters',
            currentPosition: 7,
            targetPoints: 3,
            currentPoints: 10
        },
        {
            teamName: 'Dreamers',
            currentPosition: 8,
            targetPoints: 74,
            currentPoints: 2
        },
        {
            teamName: 'Posers',
            currentPosition: 4,
            targetPoints: 65,
            currentPoints: 20
        },
        {
            teamName: 'Hackney Hackers',
            currentPosition: 3,
            targetPoints: 38,
            currentPoints: 22
        }];

        var chart = new insight.Chart('League', '#league')
            .width(500)
            .height(500)
            .legend(new insight.Legend())
            .margin(
            {
                top: 20,
                left: 85,
                bottom: 110,
                right: 40
            });

        var x = new insight.Axis('Team', insight.Scales.Ordinal)
            .tickLabelRotation(45)
            .isOrdered(true)
            .orderingFunction(function(a, b)
            {
                return a.currentPosition - b.currentPosition;
            });

        var y = new insight.Axis('Points', insight.Scales.Linear);

        chart.xAxis(x);
        chart.yAxis(y);

        var teamNameFunc = function(d)
        {
            return d.teamName;
        };

        var currentPoints = new insight.ColumnSeries('Current', leaguePlaces, x, y)
            .keyFunction(teamNameFunc)
            .valueFunction(function(d)
            {
                return d.currentPoints;
            });

        var targetPoints = new insight.MarkerSeries('Target', leaguePlaces, x, y)
            .keyFunction(teamNameFunc)
            .valueFunction(function(d)
            {
                return d.targetPoints;
            })
            .widthFactor(0.7);

        chart.series([currentPoints, targetPoints]);

        chart.draw();

    });
