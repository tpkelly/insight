var sourceData = 
[{'Id':1,'Forename':'Martin','Surname':'Watkins','Country':'Scotland','DisplayColour':'#38d33c','Age':1,'IQ':69,'Gender':'Male','Interests':['Ballet', 'Music', 'Climbing']},
{'Id':2,'Forename':'Teresa','Surname':'Knight','Country':'Scotland','DisplayColour':'#6ee688','Age':20,'IQ':103,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
{'Id':3,'Forename':'Mary','Surname':'Lee','Country':'Wales','DisplayColour':'#8e6bc2','Age':3,'IQ':96,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
{'Id':4,'Forename':'Sandra','Surname':'Harrison','Country':'Northern Ireland','DisplayColour':'#02acd0','Age':16,'IQ':55, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
{'Id':5,'Forename':'Frank','Surname':'Cox','Country':'England','DisplayColour':'#0b281c','Age':5,'IQ':105,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
{'Id':6,'Forename':'Mary','Surname':'Jenkins','Country':'England','DisplayColour':'#5908e3','Age':19,'IQ':69,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
{'Id':7,'Forename':'Earl','Surname':'Stone','Country':'Wales','DisplayColour':'#672542','Age':6,'IQ':60,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Male'},
{'Id':8,'Forename':'Ashley','Surname':'Carr','Country':'England','DisplayColour':'#f9874f','Age':18,'IQ':63,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
{'Id':9,'Forename':'Judy','Surname':'Mcdonald','Country':'Northern Ireland','DisplayColour':'#3ab1a8','Age':2,'IQ':70,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
{'Id':10,'Forename':'Earl','Surname':'Flores','Country':'England','DisplayColour':'#1be47c','Age':20,'IQ':93,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
{'Id':11,'Forename':'Terry','Surname':'Wheeler','Country':'Wales','DisplayColour':'#2cd57b','Age':4,'IQ':87,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
{'Id':12,'Forename':'Willie','Surname':'Reid','Country':'Northern Ireland','DisplayColour':'#7fcf1e','Age':7,'IQ':86,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
{'Id':13,'Forename':'Deborah','Surname':'Palmer','Country':'Northern Ireland','DisplayColour':'#9fd1d5','Age':5,'IQ':85,'Interests':['Climbing', 'Boxing'], 'Gender':'Female'},
{'Id':14,'Forename':'Annie','Surname':'Jordan','Country':'England','DisplayColour':'#8f4fd1','Age':10,'IQ':100, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
{'Id':15,'Forename':'Craig','Surname':'Gibson','Country':'England','DisplayColour':'#111ab4','Age':7,'IQ':106,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
{'Id':16,'Forename':'Lisa','Surname':'Parker','Country':'England','DisplayColour':'#52d5cf','Age':18,'IQ':53,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Female'},
{'Id':17,'Forename':'Samuel','Surname':'Willis','Country':'Wales','DisplayColour':'#e2f6cc','Age':11,'IQ':98, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
{'Id':18,'Forename':'Lisa','Surname':'Chapman','Country':'Northern Ireland','DisplayColour':'#1c5829','Age':7,'IQ':51, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
{'Id':19,'Forename':'Ryan','Surname':'Freeman','Country':'Scotland','DisplayColour':'#6cbc04','Age':12,'IQ':96, 'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
{'Id':20,'Forename':'Frances','Surname':'Lawson','Country':'Northern Ireland','DisplayColour':'#e739c9','Age':14,'IQ':71, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'}];

describe('Correlation', function() {
    
    var errorContainer;
    
    var expectInvalidPairs = function(errorContainer, expectedData) {

        expect(errorContainer.message()).toBe(insight.ErrorMessages.nonNumericalPairsException);
        expect(errorContainer.state()).toBe(insight.ErrorContainer.State.warning);
        expect(errorContainer.data()).toEqual(expectedData);
        
    };
    
    var expectNonArrayError = function(errorContainer) {

        expect(errorContainer.message()).toBe(insight.ErrorMessages.invalidArrayParameterException);
        expect(errorContainer.data()).toBeNull();
        expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);
        
    };
    
    beforeEach(function() {
    
        errorContainer = new insight.ErrorContainer();
    
    });
    
    describe('fromValues', function() {

        var xValues = [93.74846191, 67.21919571, 56.60784983, 29.78526138, 81.7769724, 99.53157838, 38.48298085,
            40.47872804, 38.7105253, 40.89977861, 63.36227625, 16.39453255, 45.36243978, 53.86195736,
            48.82481031, 97.24505443, 32.35019063, 40.5401363, 27.99488696, 12.09469436, 99.01030378
        ];

        var yValues = [284.3699706, 160.5027841, 253.1279706, 254.3109072, 221.0078791, 131.5432229, 114.6268283,
            36.50619904, -91.19169747, -75.94170661, 31.61356244, 124.6459962, -68.19947738, 143.0487732,
            203.7841096, 339.4097217, -102.2035722, 227.1428013, 171.3544472, -77.32741018, 40.2348384
        ];

    
        it('calculates expected correlation', function() {

            var r = insight.correlation.fromValues(xValues, yValues);

            expect(r).toBeCloseTo(0.4187);

        });

        it('returns undefined if no parameters', function() {

            // When
            var r = insight.correlation.fromValues();

            // Then
            expect(r).not.toBeDefined();

        });

        it('returns undefined if null parameters', function() {

            // When
            var r = insight.correlation.fromValues(null, null);

            // Then
            expect(r).not.toBeDefined();

        });

        it('returns undefined if one parameter', function() {

            // Given
            var r = insight.correlation.fromValues(xValues);

            // Then
            expect(r).not.toBeDefined();

        });

        it('returns undefined if first parameter not array', function() {

            // Given
            var notArray = {};
            spyOn(insight.utils, 'isArray').andCallThrough();

            // When
            var r = insight.correlation.fromValues(notArray, yValues);

            // Then
            expect(r).not.toBeDefined();
            expect(insight.utils.isArray).toHaveBeenCalledWith(notArray);
            expect(insight.utils.isArray).not.toHaveBeenCalledWith(yValues);

        });

        it('returns undefined if second parameter not array', function() {

            // Given
            var notArray = {};
            spyOn(insight.utils, 'isArray').andCallThrough();

            // When
            var r = insight.correlation.fromValues(xValues, notArray);

            // Then
            expect(r).not.toBeDefined();
            expect(insight.utils.isArray).toHaveBeenCalledWith(xValues);
            expect(insight.utils.isArray).toHaveBeenCalledWith(notArray);

        });
        
        it('sets error in error container if no parameters', function() {

            // When
            var r = insight.correlation.fromValues(undefined, undefined, errorContainer);

            // Then
            expect(r).not.toBeDefined();
            expectNonArrayError(errorContainer);

        });

        it('sets error in error container if null parameters', function() {

            // When
            var r = insight.correlation.fromValues(null, null, errorContainer);

            // Then
            expect(r).not.toBeDefined();
            expectNonArrayError(errorContainer);

        });

        it('sets error in error container if one parameter', function() {

            // Given
            var r = insight.correlation.fromValues(xValues, undefined, errorContainer);

            // Then
            expect(r).not.toBeDefined();
            expectNonArrayError(errorContainer);

        });

        it('sets error in error container if first parameter not array', function() {

            // Given
            var notArray = {};
            spyOn(insight.utils, 'isArray').andCallThrough();

            // When
            var r = insight.correlation.fromValues(notArray, yValues, errorContainer);

            // Then
            expect(r).not.toBeDefined();
            expect(insight.utils.isArray).toHaveBeenCalledWith(notArray);
            expect(insight.utils.isArray).not.toHaveBeenCalledWith(yValues);
            expectNonArrayError(errorContainer);

        });

        it('sets error in error container if second parameter not array', function() {

            // Given
            var notArray = {};
            spyOn(insight.utils, 'isArray').andCallThrough();

            // When
            var r = insight.correlation.fromValues(xValues, notArray, errorContainer);

            // Then
            expect(r).not.toBeDefined();
            expect(insight.utils.isArray).toHaveBeenCalledWith(xValues);
            expect(insight.utils.isArray).toHaveBeenCalledWith(notArray);
            expectNonArrayError(errorContainer);

        });
        
        it('returns undefined if arrays not equal length', function() {

            // When
            var r = insight.correlation.fromValues([1, 2, 3], [1, 2, 3, 4]);

            // Then
            expect(r).not.toBeDefined();

        });

        it('sets error in error container if arrays not equal length', function() {

            // When
            var r = insight.correlation.fromValues([1, 2, 3], [1, 2, 3, 4], errorContainer);

            // Then
            var errorData = {
                xLength : 3,
                yLength : 4
            };

            expect(r).not.toBeDefined();
            
            expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);
            expect(errorContainer.data()).toEqual(errorData);
            expect(errorContainer.message()).toBe(insight.ErrorMessages.unequalLengthArraysException);

        });

        it('returns 1 if arrays only contain one element', function() {

            // When
            var r = insight.correlation.fromValues([3], [1]);

            // Then
            expect(r).toBe(1);

        });

        it('returns 1 if arrays only contain one valid pair', function() {

            // When
            var r = insight.correlation.fromValues(['a', 2, 3], [1, 'b', 1]);

            // Then
            expect(r).toBe(1);

        });

        it('returns 0 if both arrays empty', function() {

            // When
            var r = insight.correlation.fromValues([], []);

            // Then
            expect(r).toBe(0);

        });

        it('returns 0 if both arrays contain zero valid pairs', function() {

            // When
            var r = insight.correlation.fromValues(['a', 2], [1, 'b']);

            // Then
            expect(r).toBe(0);

        });

        it('sets warning in error container if arrays only contain one valid pair', function() {

            // When
            var r = insight.correlation.fromValues(['a', 2, 3], [1, 'b', 1], errorContainer);

            // Then
            var ignoredValueExpectation = [{
                x: 'a',
                y: 1,
                index: 0
            }, {
                x: 2,
                y: 'b',
                index: 1
            }];

            expect(r).toBe(1);
            expectInvalidPairs(errorContainer, ignoredValueExpectation);

        });

        it('sets warning in error container if both arrays contain zero valid pairs', function() {

            // When
            var r = insight.correlation.fromValues(['a', 2], [1, 'b'], errorContainer);

            // Then
            var ignoredValueExpectation = [{
                x: 'a',
                y: 1,
                index: 0
            }, {
                x: 2,
                y: 'b',
                index: 1
            }];

            expect(r).toBe(0);
            expectInvalidPairs(errorContainer, ignoredValueExpectation);

        });

        it('sets warning in error container if any non-number in first array', function() {

            // When
            var result = insight.correlation.fromValues([1, 'a', 3, 8, 14, 22], [4, 5, 62, 11, 17, 23], errorContainer);

            // Then
            var expectedWarningData = [{
                x: 'a',
                y: 5,
                index: 1
            }];
            
            expect(result).toBeCloseTo(-0.1302);
            expectInvalidPairs(errorContainer, expectedWarningData);

        });

        it('sets warning in error container if any non-number in second array', function() {

            // When
            var result = insight.correlation.fromValues([1, 1, 3, 8, 14, 22], [4, 'b', 62, 11, 17, 23], errorContainer);

            // Then
            var expectedWarningData = [{
                x: 1,
                y: 'b',
                index: 1
            }];
            
            expect(result).toBeCloseTo(-0.1302);
            expectInvalidPairs(errorContainer, expectedWarningData);

        });

        it('calculates expected correlation if any non-number in first array and no error container provided', function() {

            // When
            var result = insight.correlation.fromValues([1, 'a', 3, 8, 14, 22], [4, 5, 62, 11, 17, 23]);

            // Then
            expect(result).toBeCloseTo(-0.1302);

        });

        it('calculates expected correlation if any non-number in second array and no error container provided', function() {

            // When
            var result = insight.correlation.fromValues([1, 1, 3, 8, 14, 22], [4, 'b', 62, 11, 17, 23]);

            // Then
            expect(result).toBeCloseTo(-0.1302);

        });

    });

    describe('fromDataSet', function() {

        var iqFunc = function(d) {
            return d.IQ;
        };
        var ageFunc = function(d) {
            return d.Age;
        };
        var idFunc = function(d) {
            return d.Id;
        };

        beforeEach(function() {
            spyOn(insight.utils, 'isFunction').andCallThrough();
        });

        it('calculates correlation of given pairs given a DataSet', function() {

            // Given
            var dataset = new insight.DataSet(sourceData);

            // When
            var result = insight.correlation.fromDataSet(dataset, iqFunc, ageFunc);

            // Then
            expect(result).toBeCloseTo(-0.1246);

        });

        it('calculates correlation of given pairs given an Array', function() {

            // Given
            var arrayData = sourceData;

            // When
            var result = insight.correlation.fromDataSet(arrayData, idFunc, ageFunc);

            // Then
            expect(result).toBeCloseTo(0.0712);

        });

        it('returns undefined if first argument not insight.DataSet or Array and no error conatiner provided', function() {

            // Given
            var notDatasetOrArray = {
                an: 'object'
            };
            var result;

            // When
            result = insight.correlation.fromDataSet(notDatasetOrArray, idFunc, ageFunc);

            // Then
            expect(result).not.toBeDefined();

        });

        it('sets error in error container if first argument not insight.DataSet or Array', function() {

            // Given
            var notDatasetOrArray = {
                an: 'object'
            };
            
            var result;

            // When
            result = insight.correlation.fromDataSet(notDatasetOrArray, idFunc, ageFunc, errorContainer);

            // Then
            expect(result).not.toBeDefined();
            expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);
            expect(errorContainer.data()).toBeNull();
            expect(errorContainer.message()).toBe(insight.ErrorMessages.invalidDataSetOrArrayParameterException);

        });

        it('successful correlation calculations do not update error container', function() {

            // Given
            var arrayData = sourceData;

            // When
            var result = insight.correlation.fromDataSet(arrayData, idFunc, ageFunc, errorContainer);

            // Then
            expect(errorContainer.message()).toBeNull();
            expect(errorContainer.data()).toBeNull();
            expect(errorContainer.state()).toBe(insight.ErrorContainer.State.success);

        });

        it('returns undefined if xFunction is not a function', function() {

            // Given
            var arrayData = sourceData;
            var notAFunction = ['An Array'];

            // When
            var result = insight.correlation.fromDataSet(arrayData, notAFunction, ageFunc);

            // Then
            expect(result).not.toBeDefined();
            expect(insight.utils.isFunction).toHaveBeenCalledWith(notAFunction);

        });

        it('returns undefined if yFunction is not a function', function() {

            // Given
            var arrayData = sourceData;
            var notAFunction = {
                an: 'object'
            };

            // When
            var result = insight.correlation.fromDataSet(arrayData, ageFunc, notAFunction);

            // Then
            expect(result).not.toBeDefined();
            expect(insight.utils.isFunction).toHaveBeenCalledWith(notAFunction);

        });

        it('sets error in error container if xFunction is not a function', function() {

            // Given
            var arrayData = sourceData;
            var notAFunction = ['An Array'];

            // When
            var result = insight.correlation.fromDataSet(arrayData, notAFunction, ageFunc, errorContainer);

            // Then
            expect(result).not.toBeDefined();
            expect(insight.utils.isFunction).toHaveBeenCalledWith(notAFunction);
            
            expect(errorContainer.message()).toBe(insight.ErrorMessages.invalidFunctionParameterException);
            expect(errorContainer.data()).toBeNull();
            expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);

        });

        it('sets error in error container if yFunction is not a function', function() {

            // Given
            var arrayData = sourceData;
            var notAFunction = ['An Array'];

            // When
            var result = insight.correlation.fromDataSet(arrayData, ageFunc, notAFunction, errorContainer);

            // Then
            expect(result).not.toBeDefined();
            expect(insight.utils.isFunction).toHaveBeenCalledWith(notAFunction);
            
            expect(errorContainer.message()).toBe(insight.ErrorMessages.invalidFunctionParameterException);
            expect(errorContainer.data()).toBeNull();
            expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);

        });
    });
});
