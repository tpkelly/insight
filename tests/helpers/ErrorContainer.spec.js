describe('ErrorContainer', function() {

    var errorContainer;

    beforeEach(function() {

        errorContainer = new insight.ErrorContainer();

    });

    describe('constructor', function() {

        describe('sets defaults', function() {
        
            it('message property to be null', function() {
                
                expect(errorContainer.message()).toBeNull();
                
            });
            
            it('data property to be null', function() {
                
                expect(errorContainer.data()).toBeNull();
                
            });
            
            it('state property to be \'success\'', function() {
                
                expect(errorContainer.state()).toBe(insight.ErrorContainer.State.success);
                
            });
        
        });
    
    });

    describe('setError', function() {

        var errorData;
        var errorMessage = 'Expected first argument to be an Array';

        describe('providing message and data', function() {
        
            beforeEach(function() {
            
                // Given
                errorData = { argument: 2 };

                // When
                errorContainer.setError(errorMessage, errorData);
            
            });
            
            it('sets message', function() {
                
                expect(errorContainer.message()).toBe(errorMessage);
                
            });
            
            it('sets data', function() {
                
                expect(errorContainer.data()).toBe(errorData);
                
            });
            
            it('sets state', function() {
                
                expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);
                
            });
            

            describe('then providing message and no data', function() {
                var secondErrorMessage = 'First argument is null';

                beforeEach(function() {

                    
                    errorContainer.setError(secondErrorMessage);

                });

                it('sets message', function() {

                    expect(errorContainer.message()).toBe(secondErrorMessage);

                });

                it('sets data', function() {

                    expect(errorContainer.data()).toBeNull();

                });

                it('sets state', function() {

                    expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);

                });

            });
            
            describe('then setting warning providing message and data', function() {
                
                var warningMessage = 'Nothing major';
                var warningData = { minor: 'Nothing to see here' };

                beforeEach(function() {
                    
                    errorContainer.setWarning(warningMessage, warningData);

                });

                it('doesn\'t set message', function() {

                    expect(errorContainer.message()).toBe(errorMessage);

                });

                it('doesn\'t set data', function() {

                    expect(errorContainer.data()).toBe(errorData);

                });

                it('doesn\'t set state', function() {

                    expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);

                });

            });
        
        });
        
        describe('providing message and no data', function() {
        
            beforeEach(function() {

                // When
                errorContainer.setError(errorMessage);
            
            });
            
            it('sets message', function() {
                
                expect(errorContainer.message()).toBe(errorMessage);
                
            });
            
            it('sets data null', function() {
                
                expect(errorContainer.data()).toBeNull();
                
            });
            
            it('sets state', function() {
                
                expect(errorContainer.state()).toBe(insight.ErrorContainer.State.error);
                
            });
        
        });
        
    });

    describe('setWarning', function() {

        var warningData;
        var warningMessage = 'Ignored some elements';

        describe('providing message and data', function() {
        
            beforeEach(function() {
            
                // Given
                warningData = [ 'Alan' ];

                // When
                errorContainer.setWarning(warningMessage, warningData);
            
            });
            
            it('sets message', function() {
                
                expect(errorContainer.message()).toBe(warningMessage);
                
            });
            
            it('sets data', function() {
                
                expect(errorContainer.data()).toBe(warningData);
                
            });
            
            it('sets state', function() {
                
                expect(errorContainer.state()).toBe(insight.ErrorContainer.State.warning);
                
            });
            

            describe('then providing message and no data', function() {
                var secondWarningMessage = 'Expecting type \'Alan\'';

                beforeEach(function() {

                    
                    errorContainer.setWarning(secondWarningMessage);

                });

                it('sets message', function() {

                    expect(errorContainer.message()).toBe(secondWarningMessage);

                });

                it('sets data', function() {

                    expect(errorContainer.data()).toBeNull();

                });

                it('sets state', function() {

                    expect(errorContainer.state()).toBe(insight.ErrorContainer.State.warning);

                });

            });
        
        });
        
        describe('providing message and no data', function() {
        
            beforeEach(function() {

                // When
                errorContainer.setWarning(warningMessage);
            
            });
            
            it('sets message', function() {
                
                expect(errorContainer.message()).toBe(warningMessage);
                
            });
            
            it('sets data null', function() {
                
                expect(errorContainer.data()).toBeNull();
                
            });
            
            it('sets state', function() {
                
                expect(errorContainer.state()).toBe(insight.ErrorContainer.State.warning);
                
            });
        
        });
        
    });

});