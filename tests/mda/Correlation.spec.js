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

    describe('fromValues', function() {
       
        var xValues =  [93.74846191, 67.21919571, 56.60784983, 29.78526138, 81.7769724, 99.53157838, 38.48298085,
                        40.47872804, 38.7105253, 40.89977861, 63.36227625, 16.39453255, 45.36243978, 53.86195736,
                        48.82481031, 97.24505443, 32.35019063, 40.5401363, 27.99488696, 12.09469436, 99.01030378];

        var yValues =  [284.3699706, 160.5027841, 253.1279706, 254.3109072, 221.0078791, 131.5432229, 114.6268283,
                        36.50619904, -91.19169747, -75.94170661, 31.61356244, 124.6459962, -68.19947738, 143.0487732,
                        203.7841096, 339.4097217, -102.2035722, 227.1428013, 171.3544472, -77.32741018, 40.2348384];
        
        var paramException = new Error('correlation.fromValues expects two array parameters of equal length');
        
        it('calcluates expected correlation', function() {

            var r = insight.correlation.fromValues(xValues, yValues);

            expect(r).toBeCloseTo(0.4187);

        });
        
        it('exception if no parameters', function() {

            // Given
            var r;
            
            // When
            expect(function() {
                r = insight.correlation.fromValues();
            })
            .toThrow(paramException);

            // Then
            expect(r).not.toBeDefined();
            
        });
        
        it('exception if null parameters', function() {

            // Given
            var r;
            
            // When
            expect(function() {
                r = insight.correlation.fromValues(null, null);
            })
            .toThrow(paramException);

            // Then
            expect(r).not.toBeDefined();
            
        });
        
        it('exception if one parameter', function() {
            
            // Given
            var r;
            
            // When
            expect(function() {
                insight.correlation.fromValues(xValues);
            })
            .toThrow(paramException);

            // Then
            expect(r).not.toBeDefined();

        });
        
        it('exception if first parameter not array', function() {

            // Given
            var notArray = {},
                r;
            spyOn(insight.Utils, 'isArray').andCallThrough();
            
            // When
            expect(function() {
                insight.correlation.fromValues(notArray, yValues);
            })
            .toThrow(paramException);

            // Then
            expect(r).not.toBeDefined();
            expect(insight.Utils.isArray).toHaveBeenCalledWith(notArray);
            expect(insight.Utils.isArray).not.toHaveBeenCalledWith(yValues);
            
        });
        
        it('exception if second parameter not array', function() {

            // Given
            var notArray = {},
                r;
            spyOn(insight.Utils, 'isArray').andCallThrough();
            
            // When
            expect(function() {
                insight.correlation.fromValues(xValues, notArray);
            })
            .toThrow(paramException);

            // Then
            expect(r).not.toBeDefined();
            expect(insight.Utils.isArray).toHaveBeenCalledWith(xValues);
            expect(insight.Utils.isArray).toHaveBeenCalledWith(notArray);

        });
        
        it('exception if arrays not equal length', function() {

            // Given
            var r;
            
            // When
            expect(function() {
                r = insight.correlation.fromValues([1, 2, 3], [1, 2, 3, 4]);
            })
            .toThrow(paramException);

            expect(r).not.toBeDefined();

        });
    
        it('NaN if arrays only contain one element', function() {

            var r = insight.correlation.fromValues([3], [1]);

            expect(isNaN(r)).toBe(true);

        });
        
    });
        
    describe('fromDataSet', function() {
       
        var noDataSet = new Error('correlation.fromDataSet expects an insight.DataSet or Array');
        
        it('exception if no arguments', function() {
        
            // Given
            var result;
            
            // When
            expect(function() {
                result = insight.correlation.fromDataSet();
            })
            .toThrow(noDataSet);
            
            // Then
            expect(result).not.toBeDefined();
            
        });
        
        it('exception if only argument is null', function() {
        
            // Given
            var result;
            
            // When
            expect(function() {
                result = insight.correlation.fromDataSet(null);
            })
            .toThrow(noDataSet);
            
            // Then
            expect(result).not.toBeDefined();
            
        });
        
        it('exception if first argument is null', function() {
        
            // Given
            var result;
            
            // When
            expect(function() {
                result = insight.correlation.fromDataSet(null, []);
            })
            .toThrow(noDataSet);
            
            // Then
            expect(result).not.toBeDefined();
            
        });
        
        it('exception if first not insight.DataSet or Array', function() {
        
            // Given
            var result;
            
            // When
            expect(function() {
                result = insight.correlation.fromDataSet({}, []);
            })
            .toThrow(noDataSet);
            
            // Then
            expect(result).not.toBeDefined();
            
        });
        
        it('calculates correlation of given pairs', function() {
       
            // Given
            var dataset = new insight.DataSet(sourceData);

            // When
            var result = insight.correlation.fromDataSet(dataset, [['IQ', 'Age'], ['Id', 'Age']]);

            // Then
            expect(result.IQ_Cor_Age).toBeCloseTo(-0.1246);
            expect(result.Age_Cor_IQ).toBeCloseTo(-0.1246);
            expect(result.Id_Cor_Age).toBeCloseTo(0.0712);
            expect(result.Age_Cor_Id).toBeCloseTo(0.0712);

        });
        
    });
    
    

});