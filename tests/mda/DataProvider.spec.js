describe('DataProvider', function() {

    var data = [
        { id: 2, key : 'b', value: 'bravo' },
        { id: 1, key : 'a', value: 'alan' },
        { id: 3, key : 'c', value: 'charlie' },
        { id: 5, key : 'e', value: 'echo' },
        { id: 4, key : 'd', value: 'delta' }
    ];

    var evenIdFilterFunc = function(d) {
        return d.id % 2 === 0;
    };

    var oddIdFilterFunc = function(d) {
        return d.id % 2 !== 0;
    };

    var descendingIdOrderFunc = function(a, b) {
        return b.id - a.id;
    };

    var ascendingIdOrderFunc = function(a, b) {
        return a.id - b.id;
    };

    describe('filterFunction', function() {

        var dataProvider;

        beforeEach(function() {
            dataProvider = new insight.DataProvider(data);
        });

        it('is null by default', function() {

            // When:
            var filterBy = dataProvider.filterFunction();

            // Then:
            expect(filterBy).toBeNull();

        });

        it('can be overridden', function() {

            // When:
            dataProvider.filterFunction(evenIdFilterFunc);

            // Then:
            expect(dataProvider.filterFunction()).toBe(evenIdFilterFunc);

        });

    });

    describe('orderingFunction', function() {

        var dataProvider;

        beforeEach(function() {
            dataProvider = new insight.DataProvider(data);
        });

        it('is null by default', function() {

            // When:
            var orderBy = dataProvider.orderingFunction();

            // Then:
            expect(orderBy).toBeNull();

        });

        it('can be overridden', function() {

            // When:
            dataProvider.orderingFunction(descendingIdOrderFunc);

            // Then:
            expect(dataProvider.orderingFunction()).toBe(descendingIdOrderFunc);

        });

    });

    describe('extractData', function() {

        var dataProvider;

        beforeEach(function(){
            dataProvider = new insight.DataProvider(data);
            spyOn(dataProvider, 'rawData').andCallThrough();
        });

        it('by default gets data using rawData', function() {

            // When:
            var result = dataProvider.extractData();

            // Then:
            expect(result).toEqual(data);
            expect(dataProvider.rawData).toHaveBeenCalled();
        });

        describe('orders data', function() {

            it('when ordering function supplied directly', function() {

                // When:
                var result = dataProvider.extractData(descendingIdOrderFunc);

                // Then:
                var expectedResult = [
                    { id: 5, key : 'e', value: 'echo' },
                    { id: 4, key : 'd', value: 'delta' },
                    { id: 3, key : 'c', value: 'charlie' },
                    { id: 2, key : 'b', value: 'bravo' },
                    { id: 1, key : 'a', value: 'alan' }
                ];

                expect(result).toEqual(expectedResult);
                expect(dataProvider.rawData).toHaveBeenCalled();

            });

            it('using orderingFunction property if no ordering function is provided directly', function() {

                // Given:
                dataProvider.orderingFunction(descendingIdOrderFunc);

                // When:
                var result = dataProvider.extractData();

                // Then:
                var expectedResult = [
                    { id: 5, key : 'e', value: 'echo' },
                    { id: 4, key : 'd', value: 'delta' },
                    { id: 3, key : 'c', value: 'charlie' },
                    { id: 2, key : 'b', value: 'bravo' },
                    { id: 1, key : 'a', value: 'alan' }
                ];

                expect(result).toEqual(expectedResult);
                expect(dataProvider.rawData).toHaveBeenCalled();

            });

            it('with supplied ordering function, when orderingFunction property has been set', function() {

                // Given:
                dataProvider.orderingFunction(descendingIdOrderFunc);

                // When:
                var result = dataProvider.extractData(ascendingIdOrderFunc);

                // Then:
                var expectedResult = [
                    { id: 1, key : 'a', value: 'alan' },
                    { id: 2, key : 'b', value: 'bravo' },
                    { id: 3, key : 'c', value: 'charlie' },
                    { id: 4, key : 'd', value: 'delta' },
                    { id: 5, key : 'e', value: 'echo' }
                ];

                expect(result).toEqual(expectedResult);
                expect(dataProvider.rawData).toHaveBeenCalled();

            });

        });

        describe('when supplied top parameter', function() {

            it('limits number of data objects', function() {

                // When:
                var result = dataProvider.extractData(null, 3);

                // Then:
                var expectedData = [
                    { id: 2, key : 'b', value: 'bravo' },
                    { id: 1, key : 'a', value: 'alan' },
                    { id: 3, key : 'c', value: 'charlie' }
                ];

                expect(result).toEqual(expectedData);
                expect(dataProvider.rawData).toHaveBeenCalled();
            });

            it('of value 0 gives empty results', function() {

                // When:
                var result = dataProvider.extractData(null, 0);

                // Then:
                expect(result).toEqual([]);
            });

            it('of negative value gives empty results', function() {

                // When:
                var result = dataProvider.extractData(null, -3);

                // Then:
                expect(result).toEqual([]);
            });

            it('applies limit after data has been ordered', function() {

                // When:
                var result = dataProvider.extractData(ascendingIdOrderFunc, 3);

                // Then:
                var expectedData = [
                    { id: 1, key : 'a', value: 'alan' },
                    { id: 2, key : 'b', value: 'bravo' },
                    { id: 3, key : 'c', value: 'charlie' }
                ];

                expect(result).toEqual(expectedData);
                expect(dataProvider.rawData).toHaveBeenCalled();
            });

            it('of null gives all results', function() {

                // When:
                var result = dataProvider.extractData(null, null);

                // Then:
                expect(result).toEqual(data);
            });

            it('of undefined gives all results', function() {

                // When:
                var result = dataProvider.extractData(null, undefined);

                // Then:
                expect(result).toEqual(data);
            });

            it('of NaN gives all results', function() {

                // When:
                var result = dataProvider.extractData(null, NaN);

                // Then:
                expect(result).toEqual(data);
            });

        });

        describe('when filterFunction has been set', function() {

            it('applies filtering to data', function() {

                // Given:
                dataProvider.filterFunction(evenIdFilterFunc);

                // When:
                var result = dataProvider.extractData();

                // Then:
                var expectedData = [
                    { id: 2, key : 'b', value: 'bravo' },
                    { id: 4, key : 'd', value: 'delta' }
                ];

                expect(result).toEqual(expectedData);
                expect(dataProvider.rawData).toHaveBeenCalled();

            });

            it('filtering takes place before top limit is applied', function() {

                // Given:
                dataProvider.filterFunction(oddIdFilterFunc);

                // When:
                var result = dataProvider.extractData(null, 2);

                // Then:
                var expectedData = [
                    { id: 1, key : 'a', value: 'alan' },
                    { id: 3, key : 'c', value: 'charlie' }
                ];

                expect(result).toEqual(expectedData);
                expect(dataProvider.rawData).toHaveBeenCalled();

            });

            it('handles when orderingFunction and top parameters are also supplied', function() {

                // Given:
                dataProvider.filterFunction(oddIdFilterFunc);

                // When:
                var result = dataProvider.extractData(descendingIdOrderFunc, 2);

                // Then:
                var expectedData = [
                    { id: 5, key : 'e', value: 'echo' },
                    { id: 3, key : 'c', value: 'charlie' }
                ];

                expect(result).toEqual(expectedData);
                expect(dataProvider.rawData).toHaveBeenCalled();

            });

        });
    });

});

