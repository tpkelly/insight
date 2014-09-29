(function(insightTesting) {

    insightTesting.matchers.toContainSameElementsAs = function(expected) {

        var actual = this.actual;

        if(actual.length !== expected.length) {

            this.message = function() {
                return 'Expected array with length ' + expected.length + ' to be length ' + actual.length + '.';
            };
        }

        var hasPassed = true;
        expected.forEach(function(d) {
            if (!insight.utils.arrayContains(actual, d)) {
                hasPassed = false;
            }
        });

        return hasPassed;
    };

})(insightTesting);
