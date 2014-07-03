describe('Chart', function() {
    
    describe('constructor', function() {

        it('sets name', function() {

            var chart = new insight.Chart('somename', 'asdads', 'ada');

            expect(chart.name).toBe('somename');

        });

        it('sets element', function() {

            var chart = new insight.Chart('somename', 'somelement', 'ada');

            expect(chart.element).toBe('somelement');

        });

        it('sets dimension', function() {

            var chart = new insight.Chart('somename', 'somelement', 'somedimension');

            expect(chart.dimension).toBe('somedimension');

        });

    });

    describe('defaults', function() {

        var chart;

        beforeEach(function() {
            chart = new insight.Chart();
        });

        it('selectedItems empty', function() {

            expect(chart.selectedItems).toEqual([]);

        });

        it('container null', function() {

            expect(chart.container).toBeNull();

        });

        it('height 300', function() {

            expect(chart.height()).toBe(300);

        });

        it('width 300', function() {

            expect(chart.width()).toBe(300);

        });

        it('margin {0,0,0,0}', function() {

            expect(chart.margin()).toEqual({
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            });

        });

        it('series empty', function() {

            expect(chart.series()).toEqual([]);

        });

        it('scales empty', function() {

            expect(chart.scales()).toEqual([]);

        });

        it('axes empty', function() {

            expect(chart.axes()).toEqual([]);

        });

        it('barPadding 0.1', function() {

            expect(chart.barPadding()).toBe(0.1);

        });

        it('title empty', function() {

            expect(chart.title()).toBe('');

        });
    });

    describe('gets and sets', function() {

        var chart;

        beforeEach(function() {
            chart = new insight.Chart('asda', 'asdads', 'ada');
        });

        it('title', function() {

            var result = chart.title('Test Chart');

            expect(chart.title()).toBe('Test Chart');
            expect(result).toBe(chart);
        });

        it('width', function() {

            var result = chart.width(123);

            expect(chart.width()).toBe(123);
            expect(result).toBe(chart);
        });

        it('height', function() {

            var result = chart.height(500);

            expect(chart.height()).toBe(500);
            expect(result).toBe(chart);
        });

        it('margin', function() {

            var result = chart.margin({
                top: 1,
                left: 2,
                right: 3,
                bottom: 4
            });

            expect(chart.margin()).toEqual({
                top: 1,
                left: 2,
                right: 3,
                bottom: 4
            });
            expect(result).toBe(chart);
        });

        it('series', function() {

            var s = {};
            var result = chart.series(s);

            expect(chart.series()).toBe(s);
            expect(result).toBe(chart);
        });

        it('autoMargin', function() {

            var result = chart.autoMargin(true);

            expect(chart.autoMargin()).toBe(true);
            expect(result).toBe(chart);
        });

    });

    describe('addAxis', function() {

        it('adds to axes', function() {

            var chart = new insight.Chart();

            expect(chart.axes()).toEqual([]);

            var a = {};

            chart.addAxis(a);

            expect(chart.axes()[0]).toBe(a);

        });

    });

    describe('init', function() {

        describe('with no arguments', function() {
            var chart, chartDiv, chartElement;

            var testInit = function(setup) {

                if(arguments.length){
                    setup();
                }
                
                chart.init();
                chartDiv = chartElement.firstChild;

            };

            beforeEach(function(){

                chartElement = document.createElement("div");
                chartElement.id  = 'testChart';

                document.body.appendChild(chartElement);   

                chart = new insight.Chart('ChartName', chartElement);                

            });

            // afterEach(function() {

            //     document.body.removeChild(chartElement);

            // });

            it('sets chart div width', function() {

                testInit(function() {
                    chart.width(12345);
                });

                expect(chartDiv.style.width).toEqual('12345px');

            });

            xit('sets chart div width mocks', function() {

                var append = {};
                var attr = {};
                var style = {};

                var D3Match = function() { };

                D3Match.prototype.append = function(el) {
                    append[el] = el;
                    return this;
                };

                D3Match.prototype.attr = function(name, value) {
                    attr[name] = value;
                    return this;
                };

                D3Match.prototype.style = function(name, value) {
                    style[name] = value;
                    return this;
                };

                var match = new D3Match();

                d3 = {
                    select: function(el) {
                        return match;
                    }
                };


                spyOn(chart, 'tooltip');
                spyOn(chart, 'draw');

                chart.init();

                expect(attr['class']).toBeDefined();

            });
        });
    });
});
