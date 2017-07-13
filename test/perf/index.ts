import { findPosition, indexArray } from '../../src/helpers/index'

let ARRAY = [];
let count = 3000;
let email = 'foo@bar.com';
while(--count) ARRAY.push('alex.kit@appsfactory.de');
ARRAY.push(email);

let IDX = indexArray(ARRAY);

console.log(findPosition(IDX, email));

UTest.benchmark({
    'simple check': {
        'find in array' () {
            let val = email;
            let i = -1,
                imax = ARRAY.length;
            while (++i < imax) {
                if (ARRAY[i] === val) {
                    return i;
                }
            } 
            return -1;
        },
        'find in string' () {
            return findPosition(IDX, email);
        }
    }
});
