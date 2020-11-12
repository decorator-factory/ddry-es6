/**
 * This module uses pure functions from ./pure to run the regexp
 * property tests using `ddry`
 */

import { RegexpSpec, parseRegexpPropertyTests } from "./pure";


const run = <K extends string>(dd, that: Record<K, RegExp>, specs: Record<K, RegexpSpec[]>) => {
    for (const {regExpDescription, properties} of parseRegexpPropertyTests(that, specs))
        dd.context(
            regExpDescription,
            () => {
                for (const {description,  specs} of properties)
                    dd.context(description, () => dd.drive(specs))
            }
        );
};


export { RegexpSpec, run };