(function() {

    function isMissing(that, name) {
        return that[name] === undefined;
    }

    function isDefined(that, name) {
        return !isMissing(that, name);
    }

    var undefinedMessages = [];



    if (isMissing(window, 'crossfilter')) {

        if (isDefined(window, 'console') && isDefined(console, 'warn')) {

            console.warn('Crossfilter is not available so you will only have basic charting functionality. See https://github.com/ScottLogic/insight for how to get started.');

        }

    }

    if (isMissing(window, 'd3')) {

        var message = 'Insight depends on d3. You must include d3 in a script tag. See https://github.com/ScottLogic/insight for how to get started.';

        throw new Error(message);

    }

})();
