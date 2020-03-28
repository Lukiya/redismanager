var POW_2_24 = Math.pow(2, 24);

var POW_2_32 = Math.pow(2, 32);

function hex(n: number): string {
    var s = "",
        v: number;
    for (var i = 7; i >= 0; --i) {
        v = (n >>> (i << 2)) & 0xF;
        s += v.toString(16);
    }
    return s;
}

function lrot(n: number, bits: number): number {
    return ((n << bits) | (n >>> (32 - bits)));
}

class Uint32ArrayBigEndian {
    bytes: Uint8Array;
    constructor(length: number) {
        this.bytes = new Uint8Array(length << 2);
    }
    get(index: number): number {
        index <<= 2;
        return (this.bytes[index] * POW_2_24)
            + ((this.bytes[index + 1] << 16)
                | (this.bytes[index + 2] << 8)
                | this.bytes[index + 3]);
    }
    set(index: number, value: number) {
        var high = Math.floor(value / POW_2_24),
            rest = value - (high * POW_2_24);
        index <<= 2;
        this.bytes[index] = high;
        this.bytes[index + 1] = rest >> 16;
        this.bytes[index + 2] = (rest >> 8) & 0xFF;
        this.bytes[index + 3] = rest & 0xFF;
    }
}

function string2ArrayBuffer(s: string): ArrayBuffer {
    s = s.replace(/[\u0080-\u07ff]/g,
        function (c: string) {
            var code = c.charCodeAt(0);
            return String.fromCharCode(0xC0 | code >> 6, 0x80 | code & 0x3F);
        });
    s = s.replace(/[\u0080-\uffff]/g,
        function (c: string) {
            var code = c.charCodeAt(0);
            return String.fromCharCode(0xE0 | code >> 12, 0x80 | code >> 6 & 0x3F, 0x80 | code & 0x3F);
        });
    var n = s.length,
        array = new Uint8Array(n);
    for (var i = 0; i < n; ++i) {
        array[i] = s.charCodeAt(i);
    }
    return array.buffer;
}

export function hash(bufferOrString: any): string {
    var source: ArrayBuffer;
    if (bufferOrString instanceof ArrayBuffer) {
        source = <ArrayBuffer>bufferOrString;
    }
    else {
        source = string2ArrayBuffer(String(bufferOrString));
    }

    var h0 = 0x67452301,
        h1 = 0xEFCDAB89,
        h2 = 0x98BADCFE,
        h3 = 0x10325476,
        h4 = 0xC3D2E1F0,
        i: number,
        sbytes = source.byteLength,
        sbits = sbytes << 3,
        minbits = sbits + 65,
        bits = Math.ceil(minbits / 512) << 9,
        bytes = bits >>> 3,
        slen = bytes >>> 2,
        s = new Uint32ArrayBigEndian(slen),
        s8 = s.bytes,
        j: number,
        w = new Uint32Array(80),
        sourceArray = new Uint8Array(source);
    for (i = 0; i < sbytes; ++i) {
        s8[i] = sourceArray[i];
    }
    s8[sbytes] = 0x80;
    s.set(slen - 2, Math.floor(sbits / POW_2_32));
    s.set(slen - 1, sbits & 0xFFFFFFFF);
    for (i = 0; i < slen; i += 16) {
        for (j = 0; j < 16; ++j) {
            w[j] = s.get(i + j);
        }
        for (; j < 80; ++j) {
            w[j] = lrot(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        }
        var a = h0,
            b = h1,
            c = h2,
            d = h3,
            e = h4,
            f: number,
            k: number,
            temp: number;
        for (j = 0; j < 80; ++j) {
            if (j < 20) {
                f = (b & c) | ((~b) & d);
                k = 0x5A827999;
            }
            else if (j < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            }
            else if (j < 60) {
                f = (b & c) ^ (b & d) ^ (c & d);
                k = 0x8F1BBCDC;
            }
            else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }

            temp = (lrot(a, 5) + f + e + k + w[j]) & 0xFFFFFFFF;
            e = d;
            d = c;
            c = lrot(b, 30);
            b = a;
            a = temp;
        }
        h0 = (h0 + a) & 0xFFFFFFFF;
        h1 = (h1 + b) & 0xFFFFFFFF;
        h2 = (h2 + c) & 0xFFFFFFFF;
        h3 = (h3 + d) & 0xFFFFFFFF;
        h4 = (h4 + e) & 0xFFFFFFFF;
    }
    return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4);
}