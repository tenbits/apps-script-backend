export function hashCode(this: void, str:string): number {
    let hash = 0,
        len = str.length;        
    for (let i = 0; i < len; i++) {
        let c = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export function hashCodeSmall (this: void, str:string): number {
    let hash = 0,
        MOD = 10007,
        shift = 29,
        len = str.length;
    for (var i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        hash = ((shift * hash) % MOD + c) % MOD;
    }
    return hash;
}