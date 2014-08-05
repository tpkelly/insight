describe("MarginMeasurer", function() {
  
  var data = [
    {key: 'Hello', value: 200},
    {key: 'World', value: 400},
    {key: 'Entry', value: 300}
  ];

  var measureCanvas,
      axisStyles,
      labelStyles,
      marginMeasurer,
      x,
      y,
      series,
      axisContext,
      labelContext,
      lineHeight;

  // a predictable length function to mock canvasContext.measureText with
  var basicLengthFunction = function(string) {
    return { width: String(string).length * 10 };
  };

  beforeEach(function () {

      measureCanvas = document.createElement('canvas');

      axisStyles = {'font-size': '10px', 'font-family': 'Helvetica', 'line-height': '18px'};
      labelStyles = {'font-size': '10px', 'font-family': 'Helvetica', 'line-height': '18px'};

      marginMeasurer = new insight.MarginMeasurer();
      lineHeight = 16;

  });

  describe('margin calculations', function () {

    beforeEach(function () {
           
            spyOn('insight.Utils', 'getDrawingContext');

      });

  });

  describe('series dimension calculations', function () {

      beforeEach(function () {
           
            axisContext = { measureText: function () {} };
            labelContext = { measureText: function () {} };

      });

      describe('horizontal series', function () {
        
        beforeEach(function () {
           x = new insight.Axis('X', insight.Scales.Linear);
           y = new insight.Axis('Y Label', insight.Scales.Ordinal);

          series = new insight.RowSeries('rowseries', data, x, y, 'silver');

          spyOn(axisContext, 'measureText').andCallFake(basicLengthFunction);
          spyOn(labelContext, 'measureText').andCallFake(basicLengthFunction);

        });

        it('will calculate axis margins with labels and no padding', function () {

            // Given

            x.tickPadding(0).tickSize(0);
            y.tickPadding(0).tickSize(0);


            // When 

            var maxDimensions = marginMeasurer.seriesLabelDimensions(series, lineHeight, axisContext, labelContext);

            var expectedMaxDimensions = {
              maxKeyHeight: 16,
              maxKeyWidth: 130,
              maxValueHeight: 16,
              maxValueWidth: 50
           };

            // Then 
            
            expect(maxDimensions).toEqual(expectedMaxDimensions);

        });



        it('will calculate axis margins when axes are not displayed', function () {

            // Given

            x.display(false);
            y.display(false);

            // When 

            var maxDimensions = marginMeasurer.seriesLabelDimensions(series, lineHeight, axisContext, labelContext);

            var expectedMaxDimensions = {
              maxKeyHeight: 0,
              maxKeyWidth: 0,
              maxValueHeight: 0,
              maxValueWidth: 0
            };

            // Then 

            expect(maxDimensions).toEqual(expectedMaxDimensions);
        });

        it('will calculate axis margins with labels and padding', function () {

            // Given

            x.tickPadding(10).tickSize(5);
            y.tickPadding(30).tickSize(10);

            // When 

            var maxDimensions = marginMeasurer.seriesLabelDimensions(series, lineHeight, axisContext, labelContext);

            var expectedMaxDimensions = {
              maxKeyHeight: 16,
              maxKeyWidth: 170,
              maxValueHeight: 16,
              maxValueWidth: 65
            };

            // Then 

            expect(maxDimensions).toEqual(expectedMaxDimensions);
        });

        it('will calculate axis margins with value rotation', function () {

            // Given

            x.tickPadding(10).tickSize(5).tickRotation(90);
            y.tickPadding(30).tickSize(10);

            // When 

            var maxDimensions = marginMeasurer.seriesLabelDimensions(series, lineHeight, axisContext, labelContext);

            var expectedMaxDimensions = {
              maxKeyHeight: 16,
              maxKeyWidth: 170,
              maxValueHeight: 65,
              maxValueWidth: 16
            };

            // Then 

            expect(maxDimensions).toEqual(expectedMaxDimensions);
        });

    });
    
    describe('vertical series', function () {
        
        beforeEach(function () {

           x = new insight.Axis('X', insight.Scales.Ordinal);
           y = new insight.Axis('Y Label', insight.Scales.Linear);

          series = new insight.ColumnSeries('columnseries', data, x, y, 'silver');

          spyOn(axisContext, 'measureText').andCallFake(basicLengthFunction);
          spyOn(labelContext, 'measureText').andCallFake(basicLengthFunction);

        });

        it('will calculate axis margins with labels and no padding', function () {

            // Given

            x.tickPadding(0).tickSize(0);
            y.tickPadding(0).tickSize(0);


            // When 

            var maxDimensions = marginMeasurer.seriesLabelDimensions(series, lineHeight, axisContext, labelContext);

            var expectedMaxDimensions = {
              maxKeyHeight: 16,
              maxKeyWidth: 70,
              maxValueHeight: 16,
              maxValueWidth: 110
           };

            // Then 
            
            expect(maxDimensions).toEqual(expectedMaxDimensions);
          
        });


        it('will calculate axis margins with labels and padding', function () {

            // Given

            x.tickPadding(20).tickSize(10);
            y.tickPadding(0).tickSize(5);

            // When 

            var maxDimensions = marginMeasurer.seriesLabelDimensions(series, lineHeight, axisContext, labelContext);

            var expectedMaxDimensions = {
              maxKeyHeight: 16,
              maxKeyWidth: 100,
              maxValueHeight: 16,
              maxValueWidth: 115
            };

            // Then 
            
            expect(maxDimensions).toEqual(expectedMaxDimensions);
          
        });

        it('will calculate axis margins with key rotation', function () {

            // Given

            x.tickPadding(20).tickSize(10).tickRotation(90);
            y.tickPadding(0).tickSize(5);

            // When 

            var maxDimensions = marginMeasurer.seriesLabelDimensions(series, lineHeight, axisContext, labelContext);

            var expectedMaxDimensions = {
              maxKeyHeight: 100,
              maxKeyWidth: 16,
              maxValueHeight: 16,
              maxValueWidth: 115
            };

            // Then 
            
            expect(maxDimensions).toEqual(expectedMaxDimensions);
          
        });

    });
      
  });

});