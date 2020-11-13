const debug = obj => console.dir(obj, { depth: null });


const DdryMock = () => {
    // Helpers:
    const runTest = ({matcher, it, i, e}) => {
        if (matcher !== "plain")
            throw new Error(`Matcher should be 'plain', got: ${matcher}`);
        const passes = JSON.stringify(i) === JSON.stringify(e);
        return {it, passes};
    };

    // State:
    const ctxStack = [];
    let ctx = { title: null, tests: [] };

    // Methods:
    const context = (title, callback) => {
        ctxStack.push(ctx);
        ctx = { title, tests: [] };
        callback();
        base = ctxStack.pop();
        base.tests.push(ctx);
        ctx = base;
    };

    const drive = t =>
        Array.isArray(t)
            ? ctx.tests.push(...t.map(runTest))
            : ctx.tests.push(runTest(t));

    const getResults = () => ctx;

    return { context, drive, getResults };
};


module.exports = (dd, {runRegexp}) => {
    const moduleMock = {
        integer: /^[-+]?(?:0|[1-9][0-9]*)$/,
        pairOfInts: /^\(\s*([-+]?(?:0|[1-9][0-9]*))\s*,\s*([-+]?(?:0|[1-9][0-9]*))\s*\)$/,
    };

    const driverMock = DdryMock();

    runRegexp(driverMock, moduleMock, {
        integer: [
            {
                it: "detects integers",
                detects: ["42", "1000", "-1", "+9999"],
            },
            {
                it: "doesn't detect floating-point numbers",
                doesNotDetect: ["3.14", "+0.0"]
            },
        ],
        pairOfInts: [
            {
                it: "detects integer pairs",
                detects: ["(-3,14)"]
            },
            { // this test should fail!
                it: "allows whitespace between sign and digits",
                detects: ["(- 3,14)"]
            },
        ]
    });

    const testResults = driverMock.getResults();
    debug(testResults);

    dd.drive([
        {
            matcher: "plain",
            it: "includes the name of the regexp in the context title",
            i: testResults.tests[0].title.includes("integer"),
            e: true
        },
        {
            matcher: "plain",
            it: "includes the regexp itself in the context title",
            i: testResults.tests[0].title.includes(moduleMock.integer.source),
            e: true
        },
        {
            matcher: "plain",
            it: "uses the `it` parameter as the title for a specific property test",
            i: [testResults.tests[0].tests[0].title, testResults.tests[0].tests[1].title],
            e: ["detects integers", "doesn't detect floating-point numbers"]
        },
        {
            matcher: "plain",
            it: "correctly renders tests for the `detects` matcher",
            i: testResults.tests[0].tests[0].tests.every(({passes}) => passes),
            e: true
        },
        {
            matcher: "plain",
            it: "correctly renders tests for the `doesNotDetect` matcher",
            i: testResults.tests[0].tests[1].tests.every(({passes}) => passes),
            e: true
        },
        {
            matcher: "plain",
            it: "successfully fails when a regexp doesn't pass a test",
            i: testResults.tests[1].tests[1].tests.some(({passes}) => !passes),
            e: true
        },
    ]);
};