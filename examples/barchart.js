 var data = [
 {
     key: 'England',
     value: 53012456
 },
 {
     key: 'Scotland',
     value: 5295000
 },
 {
     key: 'Wales',
     value: 3063456
 },
 {
     key: 'Northern Ireland',
     value: 1810863
 }];

 $(document)
     .ready(function()
     {
         var chart = new insight.Chart('Chart 1', '#exampleChart')
             .width(450)
             .height(400);

         var x = new insight.Axis('', insight.Scales.Ordinal)
             .tickLabelOrientation('tb');

         var y = new insight.Axis('Population', insight.Scales.Linear)
             .tickLabelFormat(d3.format('0,000'));

         chart.xAxis(x);
         chart.yAxis(y);

         var series = new insight.ColumnSeries('countryColumn', data, x, y);

         chart.series([series]);

         chart.draw();
     });
