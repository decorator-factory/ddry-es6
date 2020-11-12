/**
 * This module contains pure functions that manipulate specs
 */

export interface PlainDdrySpec {
    matcher: 'plain',
    it: string,
    i: [string, any],
    e: [string, any],
};


export type RegexpSpec =
      { it: string, given: string, replaces: string[], with: string[] }
    | { it: string, detects: string[] }
    | { it: string, failing: string[] }
    | { it: string, inside: string[], finds: string[] }
;


const specParsers : Record<
    'replace' | 'detect' | 'ignore' | 'find',
    {keys: string[], fn: (spec: any) => (regexp: RegExp) => PlainDdrySpec[]}
> = {
    replace: {
        keys: ['given', 'replaces', 'with'],
        fn: ({given, replaces, with: with_}) => regexp =>
            replaces
            .map((e, i) => [e, with_[i]])
            .map(([old, new_]) => ({
                matcher: 'plain',
                it: `'${old}' => '${new_}'`,
                i: [old, old.replace(regexp, given)],
                e: [old, new_],
            })),
    },
    detect: {
        keys: ['detects'],
        fn: ({detects}) => regexp =>
            detects.map(
                string => ({
                    matcher: 'plain',
                    it: `detects ${string}`,
                    i: [string, string.match(regexp) !== null],
                    e: [string, true],
            })),
    },
    ignore: {
        keys: ['doesNotDetect'],
        fn: ({doesNotDetect}) => regexp =>
            doesNotDetect.map(string => ({
                matcher: 'plain',
                it: `doesn't detect ${string}`,
                i: [string, string.match(regexp) === null],
                e: [string, true],
            })),
    },
    find: {
        keys: ['inside', 'finds'],
        fn: ({inside, finds}) => regexp =>
            inside
            .map((e, i) => [e, finds[i]])
            .map(
                ([string, groups]) => ({
                    matcher: 'plain',
                    it: `${JSON.stringify(groups)} in ${string}`,
                    i: [string, [...string.matchAll(regexp)].map((x) => [...x])],
                    e: [string, groups],
                })
            ),
    },
};


//@ts-ignore
const keysOf = <K extends string, V>(obj: Record<K, V>): K[] => Object.keys(obj);


const keysMatch = (obj: object, keys: string[]) =>
    Object.keys(obj).every(k => keys.includes(k)) && keys.every(k => k in obj);


const parseSpec = (spec: RegexpSpec) : [string, (regexp: RegExp) => PlainDdrySpec[]] => {
    const {it, ...rest} = spec;
    for (const {keys, fn} of Object.values(specParsers))
        if (keysMatch(rest, keys))
            return [it, fn(spec)];
    throw new Error(`Invalid spec, keys: [${Object.keys(spec).join(', ')}]`)
};


export const parseRegexpPropertyTests = <K extends string>(that: Record<K, RegExp>, specs: Record<K, RegexpSpec[]>) =>
    keysOf(that)
    .map(name => ({name, regExp: that[name]}))
    .map(({name, regExp}) => ({
        regExpDescription:
            `${name}: ${regExp}`,
        properties:
            specs[name]
            .map(parseSpec)
            .map(([description, fn]) => ({description, specs: fn(regExp)}))
    }));