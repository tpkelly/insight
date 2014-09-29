/**
 * Helper functions used throughout the library
 * @namespace insight.helpers.functions
 */
insight.helpers.functions = (function() {

    return {

        /**
         * Returns a property accessor function associated with a particular property name - in the form of a string.
         * The returned property accessor function takes an object and traverses the object until it finds
         * a property with that name.
         * @memberof! insight.helpers.functions
         * @param {String} propertyName - A string of the property to search, can include sub-properties using a dot notation.
         * Eg. 'value.Revenue.Sum', which cannot be indexed directly in Javascript.
         * @returns {Function} - True if the provided array contains the provided value
         * @example // Creates a forenameAccessor function
         * var anObject = {
         *     name: {
         *         forename: 'Bob'
         *     }
         * };

         * var forenameAccessor = insight.utils.createPropertyAccessor('name.forename');

         * var result = forenameAccessor(anObject); // 'Bob'
         */
        createPropertyAccessor: function(propertyName) {

            var arr = propertyName.split('.');

            return function(obj) {

                var name;
                var result = obj;

                for (var i = 0; i < arr.length; i++) {

                    if (result == null) {
                        return undefined;
                    }

                    name = arr[i];
                    result = result[name];
                }

                return result;

            };

        }
    };

}());
