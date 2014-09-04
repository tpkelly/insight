describe('helpers.functions', function() {

    describe('createPropertyAccessor', function() {
        
        it('returns simple property from an object', function() {
            
            // Given
            var anObject = {
                name: 'Alan'
            };

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor('name');
            var result = accessor(anObject);
            
            // Then
            expect(result).toBe('Alan');
            
        });
        
        it('returns simple property from multiple objects', function() {
            
            // Given
            var objects = [{
                name: 'Alan'
            },{
                name: 'Bob'
            }];

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor('name');
            var results = [];
            results.push(accessor(objects[0]));
            results.push(accessor(objects[1]));
            
            // Then
            expect(results[0]).toBe('Alan');
            expect(results[1]).toBe('Bob');
            
        });
        
        it('returns undefined if simple property doesn\'t exist', function() {
            
            // Given
            var anObject = {
                name: 'Alan'
            };
            var missingProperty = 'isHorse';
            spyOn(anObject, 'name').andCallThrough();

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor(missingProperty);
            var result = accessor(anObject);
            
            // Then
            expect(result).not.toBeDefined();
        });

        it('returns nested property from an object', function() {
            
            // Given
            var anObject = {
                name: {
                    forename: 'Bob'
                }
            };

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor('name.forename');
            var result = accessor(anObject);
            
            // Then
            expect(result).toBe('Bob');
            
        });
        
        it('returns undefined if intermediate property doesn\'t exist', function() {
            
            // Given
            var anObject = {
                one: {
                    two: {
                        three: 3
                    }
                }
            };

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor('one.deux.three');
            var result = accessor(anObject);
            
            // Then
            expect(result).not.toBeDefined();
            
        });
        
        it('returns undefined if intermediate property is null', function() {
            
            // Given
            var anObject = {
                one: {
                    two: null
                }
            };

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor('one.two.three');
            var result = accessor(anObject);
            
            // Then
            expect(result).not.toBeDefined();
            
        });
        
        it('returns undefined if intermediate property is ...', function() {
            
            // Given
            var anObject = {
                one: {
                    two: null
                }
            };

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor('one.two');
            var result = accessor(anObject);
            
            // Then
            expect(result).toBeNull();
            
        });
        
        it('returns undefined if object is undefined', function() {
            
            // Given
            var anObject = undefined;

            // When
            var accessor = insight.helpers.functions.createPropertyAccessor('anything');
            var result = accessor(anObject);
            
            // Then
            expect(result).not.toBeDefined();
            
        });
        
    });

})

