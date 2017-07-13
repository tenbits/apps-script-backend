import {hashCode, hashCodeSmall} from './string'
export function indexArray (arr: string[]): string {

    let idxArr = arr.map((x, i) => [hashCode(x), hashCodeSmall(x), i]);
    //idxArr.sort((a, b) => a[0] < b[0] ? -1 : 1);

    return idxArr.map(x => ' ' + x.join(' ')).join('\n') + '\n';
}

export function findPosition(index: string, val: string, startSearch: number = 0): number {
    let hash = hashCode(val) + '';
    let search = ' ' + hash + ' ';
    let i = index.indexOf(search, startSearch);
    if (i === -1) {
        return -1;
    }
    let [ _, _hashCodeSmall, position ] = Idx.getLine(index, i);
    if (_hashCodeSmall === hashCodeSmall(val)) {
        return position;
    }
    return findPosition(index, val, i + 1);
}

namespace Idx {
    export function getLine (index: string, lineStartPos: number): number[] {
        let hashEnd = index.indexOf(' ', lineStartPos + 1);
        let hash = index.substring(lineStartPos + 1, hashEnd);

        let hashSmallEnd = index.indexOf(' ', hashEnd + 1);
        let hashSmall = index.substring(hashEnd + 1, hashSmallEnd);

        let positionEnd = index.indexOf('\n', hashSmallEnd + 1);
        let position = index.substring(hashSmallEnd + 1, positionEnd);
        return [ +hash, +hashSmall, +position ];
    }
}