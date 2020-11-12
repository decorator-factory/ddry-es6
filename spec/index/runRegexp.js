const moduleMock = {
    integer: /^[-+]?(?:0|[1-9][0-9]*)$/,
    pairOfInts: /^\(\s*([-+]?(?:0|[1-9][0-9]*))\s*,\s*([-+]?(?:0|[1-9][0-9]*))\s*\)$/,
};


module.exports = (dd, {runRegexp}) => runRegexp(dd, moduleMock, {
    integer: [
        {
            it: "detects positive integers",
            detects: ["42", "1000", "1", "9999999", "+50"],
        },
        {
            it: "detects negative integers",
            detects: ["-42", "-1000", "-1", "-9999999"],
        },
        {
            it: "detects 0",
            detects: ["0"]
        },
        {
            it: "doesn't detect floating-point numbers",
            doesNotDetect: ["3.14", "nan", "-0.000001", "+0.0"]
        }
    ],
    pairOfInts: [
        {
            it: "detects parenthesized pairs of integers",
            detects: ["(3,14)",  "(-50,+50)", "(+50,-50)"]
        },
        {
            it: "ignores whitespace",
            detects: ["(   3 ,  14 )",  "( -50 , +50)", "(+50, -50  )"]
        },
        {
            it: "doesn't allow whitespace between the sign and the digits",
            doesNotDetect: ["(-   3 ,  14 )",  "( - 50 , +50)", "(+ 50, -   50  )"]
        },
    ]
});