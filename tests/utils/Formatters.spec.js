describe("Formatters for", function() {

    describe("currency", function() {

        it("use USD as currency", function() {
            //Given:
            var formatter = insight.Formatters.currencyFormatter;

            //Then:
            expect(formatter(5)).toBe("$5.00");
        });

        it("use commas for separating thousands", function() {
            //Given:
            var formatter = insight.Formatters.currencyFormatter;

            //Then:
            expect(formatter(123456789)).toBe("$123,456,789.00");
        });

        it("rounds to nearest cent", function() {
            //Given:
            var formatter = insight.Formatters.currencyFormatter;

            //Then:
            //Round up
            expect(formatter(123.456789)).toBe("$123.46");
            //Round down
            expect(formatter(876.54321)).toBe("$876.54");
        });

    });

    describe("numbers", function() {

        it("use commas for separating thousands", function() {
            //Given:
            var formatter = insight.Formatters.numberFormatter;

            //Then:
            expect(formatter(123456789)).toBe("123,456,789");
        });

        it("display decimal places when required", function() {
            //Given:
            var formatter = insight.Formatters.numberFormatter;

            //Then:
            expect(formatter(123.456789)).toBe("123.456789");
        });

    });

    describe("dates", function() {

        it("displays month and year", function() {
            //Given:
            formatter = insight.Formatters.dateFormatter;

            //When:
            var formattedDate = formatter(new Date(2014, 0, 1));
            expect(formattedDate).toBe("Jan 2014");
        });
    });

    describe("percentages", function() {

        it("appends % sign to a decimal", function() {
            //Given:
            formatter = insight.Formatters.percentageFormatter;

            //Then:
            expect(formatter(0.12)).toBe("12%");
        });

        it("rounds to nearest whole percentage", function() {
            //Given:
            formatter = insight.Formatters.percentageFormatter;

            //Then:
            expect(formatter(0.123)).toBe("12%");
            expect(formatter(0.126)).toBe("13%");

        })
    });

});
