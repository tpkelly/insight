(function() {

    var isMissing = function(that, name) {
        return that[name] === undefined;
    };

    var isDefined = function(that, name) {
        return !isMissing(that, name);
    };

    var undefinedMessages = [];

    if (isMissing(window, 'd3')) {

        undefinedMessages.push('d3.js');

    } else if (isMissing(d3, 'tip')) {

        undefinedMessages.push('d3.tip.js');

    }

    if (isMissing(window, 'crossfilter')) {

        if (isDefined(window, 'console') && isDefined(console, 'warn')) {

            console.warn('Crossfilter is not available so you will only have basic charting functionality. See https://github.com/ScottLogic/insight for how to get started.');

        }

    }

    if (undefinedMessages.length > 0) {

        undefinedMessages.unshift('Insight depends on d3 and d3.tip but the following are not defined:');

        var fullMessage =
            undefinedMessages.join('\n\t- ') +
            '\nYou must include script tags for the missing dependencies. See https://github.com/ScottLogic/insight for how to get started.';

        throw new Error(fullMessage);

    }

})();
