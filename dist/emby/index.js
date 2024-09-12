'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var dist = {};

var parse = {};

var utils = {};

Object.defineProperty(utils, "__esModule", { value: true });
utils.bytesToString = utils.stringToBytes = utils.NIL = utils.X500 = utils.OID = utils.URL = utils.DNS = utils.hexToByte = utils.byteToHex = void 0;
let _byteToHex = [];
let _hexToByte = {};
for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
}
utils.byteToHex = _byteToHex;
utils.hexToByte = _hexToByte;
utils.DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
utils.URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
utils.OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
utils.X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';
utils.NIL = '00000000-0000-0000-0000-000000000000';
utils.stringToBytes = (str) => {
    str = unescape(encodeURIComponent(str));
    const bytes = new Uint8Array(str.length);
    for (let j = 0; j < str.length; ++j) {
        bytes[j] = str.charCodeAt(j);
    }
    return bytes;
};
utils.bytesToString = (buf) => {
    const bufferView = new Uint8Array(buf, 0, buf.byteLength);
    return String.fromCharCode.apply(null, Array.from(bufferView));
};

Object.defineProperty(parse, "__esModule", { value: true });
parse.parse = void 0;
const utils_1$3 = utils;
parse.parse = (s, buf, offset) => {
    let i = (buf && offset) || 0;
    let ii = 0;
    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, (oct) => {
        if (ii < 16 && buf) {
            buf[i + ii++] = utils_1$3.hexToByte[oct];
        }
        return '';
    });
    while (ii < 16) {
        buf[i + ii++] = 0;
    }
    return buf;
};

var unparse = {};

Object.defineProperty(unparse, "__esModule", { value: true });
unparse.unparse = void 0;
const utils_1$2 = utils;
unparse.unparse = (buf, offset) => {
    let i = offset || 0;
    let bth = utils_1$2.byteToHex;
    return (bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        '-' +
        bth[buf[i++]] +
        bth[buf[i++]] +
        '-' +
        bth[buf[i++]] +
        bth[buf[i++]] +
        '-' +
        bth[buf[i++]] +
        bth[buf[i++]] +
        '-' +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]]);
};

var validate = {};

var regex = {};

Object.defineProperty(regex, "__esModule", { value: true });
const REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
regex.default = REGEX;

var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(validate, "__esModule", { value: true });
validate.validate = void 0;
const regex_1 = __importDefault$2(regex);
validate.validate = (uuid) => {
    return typeof uuid === 'string' && regex_1.default.test(uuid);
};

var version = {};

Object.defineProperty(version, "__esModule", { value: true });
version.version = void 0;
const validate_1$2 = validate;
version.version = (uuid) => {
    if (!validate_1$2.validate(uuid)) {
        throw TypeError('Invalid UUID');
    }
    return parseInt(uuid.substr(14, 1), 16);
};

var v1 = {};

var stringify = {};

Object.defineProperty(stringify, "__esModule", { value: true });
stringify.stringify = void 0;
const validate_1$1 = validate;
const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).substr(1));
}
stringify.stringify = (arr, offset = 0) => {
    const uuid = (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
    if (!validate_1$1.validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
};

var rng = {};

Object.defineProperty(rng, "__esModule", { value: true });
rng.rng = void 0;
const min = 0;
const max = 256;
const RANDOM_LENGTH = 16;
rng.rng = () => {
    let result = new Array(RANDOM_LENGTH);
    for (let j = 0; j < RANDOM_LENGTH; j++) {
        result[j] = 0xff & (Math.random() * (max - min) + min);
    }
    return result;
};

Object.defineProperty(v1, "__esModule", { value: true });
v1.v1 = void 0;
const stringify_1$1 = stringify;
const rng_1$1 = rng;
let _nodeId;
let _clockseq;
let _lastMSecs = 0;
let _lastNSecs = 0;
v1.v1 = (options, buf, offset = 0) => {
    let i = (buf && offset) || 0;
    const b = buf || new Uint8Array(16);
    let node = options && options.node ? options.node : _nodeId;
    let clockseq = options && options.clockseq ? options.clockseq : _clockseq;
    if (node == null || clockseq == null) {
        const seedBytes = options && options.random
            ? options.random
            : options && options.rng
                ? options.rng()
                : rng_1$1.rng();
        if (node == null) {
            node = _nodeId = [
                seedBytes[0] | 0x01,
                seedBytes[1],
                seedBytes[2],
                seedBytes[3],
                seedBytes[4],
                seedBytes[5],
            ];
        }
        if (clockseq == null) {
            clockseq = _clockseq = ((seedBytes[6] << 8) | seedBytes[7]) & 0x3fff;
        }
    }
    let msecs = options && options.msecs ? options.msecs : Date.now();
    let nsecs = options && options.nsecs ? options.nsecs : _lastNSecs + 1;
    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;
    if (dt < 0 && options && !options.clockseq) {
        clockseq = (clockseq + 1) & 0x3fff;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options && !options.nsecs) {
        nsecs = 0;
    }
    if (nsecs >= 10000) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 12219292800000;
    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = (tl >>> 24) & 0xff;
    b[i++] = (tl >>> 16) & 0xff;
    b[i++] = (tl >>> 8) & 0xff;
    b[i++] = tl & 0xff;
    const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
    b[i++] = (tmh >>> 8) & 0xff;
    b[i++] = tmh & 0xff;
    b[i++] = ((tmh >>> 24) & 0xf) | 0x10;
    b[i++] = (tmh >>> 16) & 0xff;
    b[i++] = (clockseq >>> 8) | 0x80;
    b[i++] = clockseq & 0xff;
    for (let n = 0; n < 6; ++n) {
        b[i + n] = node[n];
    }
    return buf || stringify_1$1.stringify(b);
};

var v3 = {};

var v35 = {};

Object.defineProperty(v35, "__esModule", { value: true });
v35.v35 = void 0;
const stringify_1 = stringify;
const parse_1$1 = parse;
const utils_1$1 = utils;
v35.v35 = (name, version, hashfunc) => {
    const generateUUID = (value, namespace, buf, offset = 0) => {
        if (typeof value === 'string') {
            value = utils_1$1.stringToBytes(value);
        }
        if (typeof namespace === 'string') {
            namespace = parse_1$1.parse(namespace);
        }
        if (namespace && namespace.length !== 16) {
            throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
        }
        let bytes = new Uint8Array(16 + value.length);
        bytes.set(namespace);
        bytes.set(value, namespace.length);
        bytes = utils_1$1.stringToBytes(hashfunc(utils_1$1.bytesToString(bytes)));
        bytes[6] = (bytes[6] & 0x0f) | version;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        if (buf) {
            for (let i = 0; i < 16; ++i) {
                buf[offset + i] = bytes[i];
            }
        }
        return buf ? buf : stringify_1.stringify(bytes);
    };
    return generateUUID;
};

var md5 = {};

(function (exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.any_hmac_md5 = exports.b64_hmac_md5 = exports.hex_hmac_md5 = exports.any_md5 = exports.b64_md5 = exports.hex_md5 = void 0;
    let hexcase = 0;
    let b64pad = '';
    exports.hex_md5 = (s) => rstr2hex(rstr_md5(str2rstr_utf8(s)));
    exports.default = exports.hex_md5;
    exports.b64_md5 = (s) => rstr2b64(rstr_md5(str2rstr_utf8(s)));
    exports.any_md5 = (s, e) => rstr2any(rstr_md5(str2rstr_utf8(s)), e);
    exports.hex_hmac_md5 = (k, d) => rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
    exports.b64_hmac_md5 = (k, d) => rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)));
    exports.any_hmac_md5 = (k, d, e) => rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e);
    const rstr_md5 = (s) => binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    const rstr_hmac_md5 = (key, data) => {
        var bkey = rstr2binl(key);
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        let ipad = Array(16);
        let opad = Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5c5c5c5c;
        }
        var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    };
    const rstr2hex = (input) => {
        try {
            hexcase;
        }
        catch (e) {
            hexcase = 0;
        }
        var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
        var output = '';
        var x;
        for (var i = 0; i < input.length; i++) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0f) + hex_tab.charAt(x & 0x0f);
        }
        return output;
    };
    const rstr2b64 = (input) => {
        try {
            b64pad;
        }
        catch (e) {
            b64pad = '';
        }
        var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var output = '';
        var len = input.length;
        for (var i = 0; i < len; i += 3) {
            var triplet = (input.charCodeAt(i) << 16) |
                (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) |
                (i + 2 < len ? input.charCodeAt(i + 2) : 0);
            for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 > input.length * 8) {
                    output += b64pad;
                }
                else {
                    output += tab.charAt((triplet >>> (6 * (3 - j))) & 0x3f);
                }
            }
        }
        return output;
    };
    const rstr2any = (input, encoding) => {
        var divisor = encoding.length;
        var i, j, q, x, quotient;
        var dividend = Array(Math.ceil(input.length / 2));
        for (i = 0; i < dividend.length; i++) {
            dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
        }
        var full_length = Math.ceil((input.length * 8) / (Math.log(encoding.length) / Math.log(2)));
        var remainders = Array(full_length);
        for (j = 0; j < full_length; j++) {
            quotient = [];
            x = 0;
            for (i = 0; i < dividend.length; i++) {
                x = (x << 16) + dividend[i];
                q = Math.floor(x / divisor);
                x -= q * divisor;
                if (quotient.length > 0 || q > 0) {
                    quotient[quotient.length] = q;
                }
            }
            remainders[j] = x;
            dividend = quotient;
        }
        var output = '';
        for (i = remainders.length - 1; i >= 0; i--) {
            output += encoding.charAt(remainders[i]);
        }
        return output;
    };
    const str2rstr_utf8 = (input) => {
        var output = '';
        var i = -1;
        var x, y;
        while (++i < input.length) {
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if (x >= 0xd800 && x <= 0xdbff && y >= 0xdc00 && y <= 0xdfff) {
                x = 0x10000 + ((x & 0x03ff) << 10) + (y & 0x03ff);
                i++;
            }
            if (x <= 0x7f) {
                output += String.fromCharCode(x);
            }
            else if (x <= 0x7ff) {
                output += String.fromCharCode(0xc0 | ((x >>> 6) & 0x1f), 0x80 | (x & 0x3f));
            }
            else if (x <= 0xffff) {
                output += String.fromCharCode(0xe0 | ((x >>> 12) & 0x0f), 0x80 | ((x >>> 6) & 0x3f), 0x80 | (x & 0x3f));
            }
            else if (x <= 0x1fffff) {
                output += String.fromCharCode(0xf0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3f), 0x80 | ((x >>> 6) & 0x3f), 0x80 | (x & 0x3f));
            }
        }
        return output;
    };
    const rstr2binl = (input) => {
        let output = Array(input.length >> 2);
        for (var i = 0; i < output.length; i++) {
            output[i] = 0;
        }
        for (var i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << i % 32;
        }
        return output;
    };
    const binl2rstr = (input) => {
        var output = '';
        for (var i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> i % 32) & 0xff);
        }
        return output;
    };
    const binl_md5 = (x, len) => {
        x[len >> 5] |= 0x80 << len % 32;
        x[(((len + 64) >>> 9) << 4) + 14] = len;
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);
            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);
            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);
            a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    };
    const md5_cmn = (q, a, b, x, s, t) => safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    const md5_ff = (a, b, c, d, x, s, t) => md5_cmn((b & c) | (~b & d), a, b, x, s, t);
    const md5_gg = (a, b, c, d, x, s, t) => md5_cmn((b & d) | (c & ~d), a, b, x, s, t);
    const md5_hh = (a, b, c, d, x, s, t) => md5_cmn(b ^ c ^ d, a, b, x, s, t);
    const md5_ii = (a, b, c, d, x, s, t) => md5_cmn(c ^ (b | ~d), a, b, x, s, t);
    const safe_add = (x, y) => {
        var lsw = (x & 0xffff) + (y & 0xffff);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    };
    const bit_rol = (num, cnt) => (num << cnt) | (num >>> (32 - cnt));
}(md5));
getDefaultExportFromCjs(md5);

var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(v3, "__esModule", { value: true });
v3.v3 = void 0;
const v35_1$1 = v35;
const md5_1 = __importDefault$1(md5);
v3.v3 = v35_1$1.v35('v3', 0x30, md5_1.default);

var v4 = {};

Object.defineProperty(v4, "__esModule", { value: true });
v4.v4 = void 0;
const unparse_1$1 = unparse;
const rng_1 = rng;
v4.v4 = (options, buf, offset) => {
    let i = (buf && offset) || 0;
    let rnds = rng_1.rng();
    if (options && !(options instanceof String)) {
        if (options.random) {
            rnds = options.random;
        }
        if (options.rng) {
            rnds = options.rng();
        }
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        for (var ii = 0; ii < 16; ii++) {
            buf[i + ii] = rnds[ii];
        }
    }
    return buf || unparse_1$1.unparse(rnds);
};

var v5 = {};

var sha1 = {};

(function (exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.any_hmac_sha1 = exports.b64_hmac_sha1 = exports.hex_hmac_sha1 = exports.any_sha1 = exports.b64_sha1 = exports.hex_sha1 = void 0;
    let hexcase = 0;
    let b64pad = '';
    exports.hex_sha1 = (s) => rstr2hex(rstr_sha1(str2rstr_utf8(s)));
    exports.default = exports.hex_sha1;
    exports.b64_sha1 = (s) => rstr2b64(rstr_sha1(str2rstr_utf8(s)));
    exports.any_sha1 = (s, e) => rstr2any(rstr_sha1(str2rstr_utf8(s)), e);
    exports.hex_hmac_sha1 = (k, d) => rstr2hex(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
    exports.b64_hmac_sha1 = (k, d) => rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
    exports.any_hmac_sha1 = (k, d, e) => rstr2any(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)), e);
    const rstr_sha1 = (s) => binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
    const rstr_hmac_sha1 = (key, data) => {
        let bkey = rstr2binb(key);
        if (bkey.length > 16) {
            bkey = binb_sha1(bkey, key.length * 8);
        }
        let ipad = Array(16);
        let opad = Array(16);
        for (var i = 0; i < 16; i++) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5c5c5c5c;
        }
        var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
        return binb2rstr(binb_sha1(opad.concat(hash), 512 + 160));
    };
    const rstr2hex = (input) => {
        try {
            hexcase;
        }
        catch (e) {
            hexcase = 0;
        }
        var hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
        var output = '';
        var x;
        for (var i = 0; i < input.length; i++) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0f) + hex_tab.charAt(x & 0x0f);
        }
        return output;
    };
    const rstr2b64 = (input) => {
        try {
            b64pad;
        }
        catch (e) {
            b64pad = '';
        }
        var tab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var output = '';
        var len = input.length;
        for (var i = 0; i < len; i += 3) {
            var triplet = (input.charCodeAt(i) << 16) |
                (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) |
                (i + 2 < len ? input.charCodeAt(i + 2) : 0);
            for (var j = 0; j < 4; j++) {
                if (i * 8 + j * 6 > input.length * 8) {
                    output += b64pad;
                }
                else {
                    output += tab.charAt((triplet >>> (6 * (3 - j))) & 0x3f);
                }
            }
        }
        return output;
    };
    const rstr2any = (input, encoding) => {
        var divisor = encoding.length;
        var remainders = [];
        var i, q, x, quotient;
        var dividend = Array(Math.ceil(input.length / 2));
        for (i = 0; i < dividend.length; i++) {
            dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
        }
        while (dividend.length > 0) {
            quotient = [];
            x = 0;
            for (i = 0; i < dividend.length; i++) {
                x = (x << 16) + dividend[i];
                q = Math.floor(x / divisor);
                x -= q * divisor;
                if (quotient.length > 0 || q > 0) {
                    quotient[quotient.length] = q;
                }
            }
            remainders[remainders.length] = x;
            dividend = quotient;
        }
        var output = '';
        for (i = remainders.length - 1; i >= 0; i--) {
            output += encoding.charAt(remainders[i]);
        }
        var full_length = Math.ceil((input.length * 8) / (Math.log(encoding.length) / Math.log(2)));
        for (i = output.length; i < full_length; i++) {
            output = encoding[0] + output;
        }
        return output;
    };
    const str2rstr_utf8 = (input) => {
        var output = '';
        var i = -1;
        var x, y;
        while (++i < input.length) {
            x = input.charCodeAt(i);
            y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            if (x >= 0xd800 && x <= 0xdbff && y >= 0xdc00 && y <= 0xdfff) {
                x = 0x10000 + ((x & 0x03ff) << 10) + (y & 0x03ff);
                i++;
            }
            if (x <= 0x7f) {
                output += String.fromCharCode(x);
            }
            else if (x <= 0x7ff) {
                output += String.fromCharCode(0xc0 | ((x >>> 6) & 0x1f), 0x80 | (x & 0x3f));
            }
            else if (x <= 0xffff) {
                output += String.fromCharCode(0xe0 | ((x >>> 12) & 0x0f), 0x80 | ((x >>> 6) & 0x3f), 0x80 | (x & 0x3f));
            }
            else if (x <= 0x1fffff) {
                output += String.fromCharCode(0xf0 | ((x >>> 18) & 0x07), 0x80 | ((x >>> 12) & 0x3f), 0x80 | ((x >>> 6) & 0x3f), 0x80 | (x & 0x3f));
            }
        }
        return output;
    };
    const rstr2binb = (input) => {
        var output = Array(input.length >> 2);
        for (var i = 0; i < output.length; i++) {
            output[i] = 0;
        }
        for (var i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (24 - (i % 32));
        }
        return output;
    };
    const binb2rstr = (input) => {
        var output = '';
        for (var i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (24 - (i % 32))) & 0xff);
        }
        return output;
    };
    const binb_sha1 = (x, len) => {
        x[len >> 5] |= 0x80 << (24 - (len % 32));
        x[(((len + 64) >> 9) << 4) + 15] = len;
        var w = Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;
        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;
            for (var j = 0; j < 80; j++) {
                if (j < 16) {
                    w[j] = x[i + j];
                }
                else {
                    w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                }
                let t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = bit_rol(b, 30);
                b = a;
                a = t;
            }
            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return [a, b, c, d, e];
    };
    const sha1_ft = (t, b, c, d) => {
        if (t < 20) {
            return (b & c) | (~b & d);
        }
        if (t < 40) {
            return b ^ c ^ d;
        }
        if (t < 60) {
            return (b & c) | (b & d) | (c & d);
        }
        return b ^ c ^ d;
    };
    const sha1_kt = (t) => t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
    const safe_add = (x, y) => {
        var lsw = (x & 0xffff) + (y & 0xffff);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xffff);
    };
    const bit_rol = (num, cnt) => {
        return (num << cnt) | (num >>> (32 - cnt));
    };
}(sha1));
getDefaultExportFromCjs(sha1);

var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(v5, "__esModule", { value: true });
v5.v5 = void 0;
const v35_1 = v35;
const sha1_1 = __importDefault(sha1);
v5.v5 = v35_1.v35('v5', 0x50, sha1_1.default);

Object.defineProperty(dist, "__esModule", { value: true });
const parse_1 = parse;
const unparse_1 = unparse;
const validate_1 = validate;
const version_1 = version;
const v1_1 = v1;
const v3_1 = v3;
const v4_1 = v4;
const v5_1 = v5;
const utils_1 = utils;
var _default = dist.default = {
    parse: parse_1.parse,
    unparse: unparse_1.unparse,
    validate: validate_1.validate,
    version: version_1.version,
    v1: v1_1.v1,
    v3: v3_1.v3,
    v4: v4_1.v4,
    v5: v5_1.v5,
    NIL: utils_1.NIL,
    DNS: utils_1.DNS,
    URL: utils_1.URL,
    OID: utils_1.OID,
    X500: utils_1.X500,
};

const embyAxios = require("axios");
const embyCookieManager = !(env === null || env === void 0 ? void 0 : env.debug)
    ? require("@react-native-cookies/cookies")
    : null;
const EMBY_DEVICE_NAME = "MusicFree";
const EMBY_PLUGIN_NAME = "Emby";
const EMBY_PLUGIN_VERSION = "0.0.1";
const EMBY_PAGE_SIZE = 25;
const EMBY_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0";
let embySingletonTokenRequest = null;
let embyCheckDeviceIdRequest = null;
const embyDebugAuthInfo = genDefaultEmbyAuthInfo();
const embyDebugDeviceId = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
function genDefaultEmbyAuthInfo() {
    return {
        embyBaseUrl: "",
        embyUserId: "",
        embyUsername: "",
        embyToken: "",
    };
}
function genEmbyAuthInfoFromLoginResp(baseUrl, loginResp) {
    var _a, _b, _c, _d, _e;
    return {
        embyBaseUrl: baseUrl !== null && baseUrl !== void 0 ? baseUrl : "",
        embyUserId: (_b = (_a = loginResp === null || loginResp === void 0 ? void 0 : loginResp.User) === null || _a === void 0 ? void 0 : _a.Id) !== null && _b !== void 0 ? _b : "",
        embyUsername: (_d = (_c = loginResp === null || loginResp === void 0 ? void 0 : loginResp.User) === null || _c === void 0 ? void 0 : _c.Name) !== null && _d !== void 0 ? _d : "",
        embyToken: (_e = loginResp === null || loginResp === void 0 ? void 0 : loginResp.AccessToken) !== null && _e !== void 0 ? _e : "",
    };
}
async function storeEmbyAuthInfo(baseUrl, authInfo) {
    var _a, _b, _c, _d;
    if (!embyCookieManager) {
        return await new Promise((resolve, reject) => {
            var _a, _b, _c, _d;
            try {
                embyDebugAuthInfo.embyBaseUrl = (_a = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyBaseUrl) !== null && _a !== void 0 ? _a : "";
                embyDebugAuthInfo.embyUserId = (_b = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyUserId) !== null && _b !== void 0 ? _b : "";
                embyDebugAuthInfo.embyUsername = (_c = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyUsername) !== null && _c !== void 0 ? _c : "";
                embyDebugAuthInfo.embyToken = (_d = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyToken) !== null && _d !== void 0 ? _d : "";
                resolve("success");
            }
            catch (err) {
                reject(err);
            }
        });
    }
    else {
        const embyBaseUrlStore = embyCookieManager.set(baseUrl, {
            name: "embyBaseUrl",
            value: (_a = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyBaseUrl) !== null && _a !== void 0 ? _a : "",
        });
        const embyUserIdStore = embyCookieManager.set(baseUrl, {
            name: "embyUserId",
            value: (_b = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyUserId) !== null && _b !== void 0 ? _b : "",
        });
        const embyUsernameStore = embyCookieManager.set(baseUrl, {
            name: "embyUsername",
            value: (_c = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyUsername) !== null && _c !== void 0 ? _c : "",
        });
        const embyTokenStore = embyCookieManager.set(baseUrl, {
            name: "embyToken",
            value: (_d = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyToken) !== null && _d !== void 0 ? _d : "",
        });
        return await Promise.all([
            embyBaseUrlStore,
            embyUserIdStore,
            embyUsernameStore,
            embyTokenStore,
        ]).catch((err) => Promise.reject(err));
    }
}
async function storeEmbyDeviceId(baseUrl, deviceId) {
    if (!embyCookieManager) {
        return await new Promise((resolve, reject) => {
            try {
                resolve("success");
            }
            catch (err) {
                reject(err);
            }
        });
    }
    else {
        return await embyCookieManager.set(baseUrl, {
            name: "embyDeviceId",
            value: deviceId,
        });
    }
}
async function getStoredEmbyDeviceId(baseUrl) {
    if (!embyCookieManager) {
        return await new Promise((resolve) => {
            resolve(embyDebugDeviceId);
        }).catch((err) => Promise.reject(err));
    }
    else {
        return await embyCookieManager
            .get(baseUrl)
            .then((cookies) => {
            var _a, _b;
            return Promise.resolve((_b = (_a = cookies.embyDeviceId) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : "");
        })
            .catch((err) => Promise.reject(err));
    }
}
async function getStoredEmbyAuthInfo(baseUrl) {
    if (!embyCookieManager) {
        return await new Promise((resolve) => {
            resolve(embyDebugAuthInfo);
        }).catch((err) => Promise.reject(err));
    }
    else {
        return await embyCookieManager
            .get(baseUrl)
            .then((cookies) => {
            var _a, _b, _c, _d;
            return Promise.resolve({
                embyBaseUrl: (_a = cookies.embyBaseUrl) === null || _a === void 0 ? void 0 : _a.value,
                embyUserId: (_b = cookies.embyUserId) === null || _b === void 0 ? void 0 : _b.value,
                embyUsername: (_c = cookies.embyUsername) === null || _c === void 0 ? void 0 : _c.value,
                embyToken: (_d = cookies.embyToken) === null || _d === void 0 ? void 0 : _d.value,
            });
        })
            .catch((err) => Promise.reject(err));
    }
}
async function resetStoredEmbyAuthInfo(baseUrl) {
    return await storeEmbyAuthInfo(baseUrl, genDefaultEmbyAuthInfo());
}
function getEmbyUserVariables() {
    var _a, _b, _c;
    let userVariables = (_a = env === null || env === void 0 ? void 0 : env.getUserVariables()) !== null && _a !== void 0 ? _a : {};
    if (!((_b = userVariables === null || userVariables === void 0 ? void 0 : userVariables.url) === null || _b === void 0 ? void 0 : _b.startsWith("http://")) &&
        !((_c = userVariables === null || userVariables === void 0 ? void 0 : userVariables.url) === null || _c === void 0 ? void 0 : _c.startsWith("https://"))) {
        userVariables.url = `http://${userVariables.url}`;
    }
    return userVariables;
}
function getConfigEmbyBaseUrl() {
    var _a, _b, _c;
    return (_c = (_b = (_a = getEmbyUserVariables()) === null || _a === void 0 ? void 0 : _a.url) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
}
function getConfigEmbyUsername() {
    var _a, _b, _c;
    return (_c = (_b = (_a = getEmbyUserVariables()) === null || _a === void 0 ? void 0 : _a.username) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
}
function getConfigEmbyPassword() {
    var _a, _b, _c;
    return (_c = (_b = (_a = getEmbyUserVariables()) === null || _a === void 0 ? void 0 : _a.password) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
}
function isEmbyAuthInfoValid(info) {
    return (info &&
        info.embyUserId &&
        info.embyUserId.length > 0 &&
        info.embyUsername &&
        info.embyUsername.length > 0 &&
        info.embyToken &&
        info.embyToken.length > 0);
}
function isEmbyLoginUrl(baseUrl, url) {
    return (baseUrl &&
        baseUrl === getConfigEmbyBaseUrl() &&
        url &&
        url.startsWith("/emby/Users/AuthenticateByName"));
}
function isEmbyUrl(baseUrl, url) {
    return (isEmbyLoginUrl(baseUrl, url) ||
        (baseUrl &&
            baseUrl === getConfigEmbyBaseUrl() &&
            url &&
            url.startsWith("/emby")));
}
const embyService = embyAxios.create({
    timeout: 30000,
    headers: { "User-Agent": EMBY_UA },
});
embyService.interceptors.request.use(async function (config) {
    var _a, _b;
    config.baseURL = (_a = config.baseURL) !== null && _a !== void 0 ? _a : getConfigEmbyBaseUrl();
    if (config.method === "post") {
        config.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    const ifLoginUrl = isEmbyLoginUrl(config.baseURL, config.url);
    const ifEmbyUrl = isEmbyUrl(config.baseURL, config.url);
    if (ifEmbyUrl) {
        const deviceId = await checkAndGetEmbyDeviceId(config.baseURL);
        const authInfoClinet = `Emby Client=MusicFree-${EMBY_PLUGIN_NAME}-Plugin`;
        const authInfoDevice = `Device=${EMBY_DEVICE_NAME}`;
        const authInfoDeviceId = `DeviceId=${deviceId}`;
        const authInfoVersion = `Version=${EMBY_PLUGIN_VERSION}`;
        let authHeader = `${authInfoClinet}, ${authInfoDevice}, ${authInfoDeviceId}, ${authInfoVersion}`;
        if (!ifLoginUrl) {
            let authInfo = await getStoredEmbyAuthInfo(config.baseURL);
            const baseURLHost = config.baseURL
                ? new URL(config.baseURL).host
                : null;
            const storedBaseURLHost = (authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyBaseUrl)
                ? new URL(authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyBaseUrl).host
                : null;
            if (((storedBaseURLHost === null || storedBaseURLHost === void 0 ? void 0 : storedBaseURLHost.length) > 0 &&
                baseURLHost !== storedBaseURLHost) ||
                (((_b = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyUsername) === null || _b === void 0 ? void 0 : _b.length) > 0 &&
                    getConfigEmbyUsername() !== (authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyUsername))) {
                await resetStoredEmbyAuthInfo(config.baseURL);
                authInfo = null;
            }
            if (!isEmbyAuthInfoValid(authInfo)) {
                await requestEmbyToken();
                authInfo = await getStoredEmbyAuthInfo(config.baseURL);
            }
            if (isEmbyAuthInfoValid(authInfo)) {
                authHeader = `Emby UserId=${authInfo.embyUserId}, ${authHeader}`;
                config.headers["X-Emby-Token"] = authInfo.embyToken;
                if (config.url && config.url.startsWith("/emby/UserItems")) {
                    config.url = `/emby/Users/${authInfo.embyUserId}/Items`;
                }
                if (config.url && config.url.startsWith("/emby/UserGetItem")) {
                    config.url = `/emby/Users/${authInfo.embyUserId}/Items/${config.url
                        .split("/")
                        .pop()}`;
                }
            }
        }
        config.headers["Authorization"] = authHeader;
    }
    return Promise.resolve(config);
}, (error) => {
    return Promise.reject(error);
});
embyService.interceptors.response.use(async function (response) {
    return Promise.resolve(response);
}, async function (error) {
    var _a;
    if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
        const ifEmbyUrl = isEmbyUrl(error.config.baseURL, error.config.url);
        if (ifEmbyUrl) {
            if (!isEmbyLoginUrl(error.config.baseURL, error.config.url)) {
                await requestEmbyToken();
                const authInfo = await getStoredEmbyAuthInfo(error.config.baseURL);
                if (isEmbyAuthInfoValid(authInfo)) {
                    return await embyService.request(error.config);
                }
            }
            await resetStoredEmbyAuthInfo(error.config.baseURL);
        }
    }
    return Promise.reject(error);
});
function checkAndGetEmbyDeviceId(baseUrl) {
    if (embyCheckDeviceIdRequest !== null) {
        return embyCheckDeviceIdRequest;
    }
    embyCheckDeviceIdRequest = new Promise(async function (resolve, reject) {
        try {
            let deviceId = await getStoredEmbyDeviceId(baseUrl);
            if (!deviceId || deviceId.length <= 0) {
                deviceId = _default.v4().toString();
                await storeEmbyDeviceId(baseUrl, deviceId);
            }
            resolve(deviceId);
        }
        catch (err) {
            reject(err);
        }
    });
    embyCheckDeviceIdRequest.finally(() => {
        embyCheckDeviceIdRequest = null;
    });
    return embyCheckDeviceIdRequest;
}
function requestEmbyToken() {
    if (embySingletonTokenRequest !== null) {
        return embySingletonTokenRequest;
    }
    const username = getConfigEmbyUsername();
    const password = getConfigEmbyPassword();
    embySingletonTokenRequest = new Promise(async function (resolve, reject) {
        const baseUrl = getConfigEmbyBaseUrl();
        await embyService
            .post("/emby/Users/AuthenticateByName", {
            Username: username,
            Pw: password,
        })
            .then(async function ({ data }) {
            try {
                await storeEmbyAuthInfo(baseUrl, genEmbyAuthInfoFromLoginResp(baseUrl, data));
                resolve(data);
            }
            catch (err) {
                reject(err);
            }
        })
            .catch(async function (err) {
            try {
                await resetStoredEmbyAuthInfo(baseUrl);
            }
            finally {
                reject(err);
            }
        });
    });
    embySingletonTokenRequest.finally(() => {
        embySingletonTokenRequest = null;
    });
    return embySingletonTokenRequest;
}
async function getEmbyMusicGenres(size) {
    return await embyService
        .get("/emby/MusicGenres", {
        params: {
            StartIndex: 0,
            Limit: size,
            IncludeItemTypes: "MusicAlbum",
        },
    })
        .then((resp) => {
        var _a, _b;
        return Promise.resolve((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.Items) !== null && _b !== void 0 ? _b : []);
    })
        .catch((err) => Promise.reject(err));
}
async function getEmbyUserMusicLibraries() {
    return await embyService
        .get("/emby/UserItems")
        .then((resp) => {
        var _a, _b, _c;
        return Promise.resolve((_c = (_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.Items) === null || _b === void 0 ? void 0 : _b.filter((it) => it.CollectionType === "music")) !== null && _c !== void 0 ? _c : []);
    })
        .catch((err) => Promise.reject(err));
}
async function getEmbyUserMusicPlaylist(page) {
    return await embyService
        .get("/emby/UserItems", {
        params: {
            StartIndex: (page - 1) * EMBY_PAGE_SIZE,
            Limit: EMBY_PAGE_SIZE,
            IncludeItemTypes: "Playlist",
            Tags: "music",
            Recursive: true,
            EnableUserData: true,
            EnableImageTypes: "Primary",
            Fields: "BasicSyncInfo,Overview,DateCreated",
        },
    })
        .then((resp) => {
        var _a, _b;
        return Promise.resolve((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.Items) !== null && _b !== void 0 ? _b : []);
    })
        .catch((err) => Promise.reject(err));
}
async function getEmbyAlbumsByGenre(genreId, page) {
    return await embyService
        .get("/emby/UserItems", {
        params: {
            StartIndex: (page - 1) * EMBY_PAGE_SIZE,
            Limit: EMBY_PAGE_SIZE,
            IncludeItemTypes: "MusicAlbum",
            Recursive: true,
            GenreIds: genreId,
            EnableUserData: true,
            EnableImageTypes: "Primary",
            Fields: "BasicSyncInfo,Overview,ProductionYear,DateCreated",
        },
    })
        .then((resp) => {
        var _a, _b;
        return Promise.resolve((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.Items) !== null && _b !== void 0 ? _b : []);
    })
        .catch((err) => Promise.reject(err));
}
async function getEmbyAlbumsByParent(parentId, page) {
    return await embyService
        .get("/emby/UserItems", {
        params: {
            StartIndex: (page - 1) * EMBY_PAGE_SIZE,
            Limit: EMBY_PAGE_SIZE,
            IncludeItemTypes: "MusicAlbum",
            Recursive: true,
            ParentId: parentId,
            EnableUserData: true,
            EnableImageTypes: "Primary",
            Fields: "BasicSyncInfo,Overview,ProductionYear,DateCreated",
        },
    })
        .then((resp) => {
        var _a, _b;
        return Promise.resolve((_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.Items) !== null && _b !== void 0 ? _b : []);
    })
        .catch((err) => Promise.reject(err));
}
async function getEmbyMusicListByParent(parentId, page) {
    return await embyService
        .get("/emby/UserItems", {
        params: {
            StartIndex: (page - 1) * EMBY_PAGE_SIZE,
            Limit: EMBY_PAGE_SIZE,
            ParentId: parentId,
            MediaTypes: "Audio",
            EnableUserData: true,
            EnableImageTypes: "Primary",
            Fields: "BasicSyncInfo,Overview,ProductionYear,DateCreated",
        },
    })
        .then((resp) => {
        var _a;
        return Promise.resolve((_a = resp.data) !== null && _a !== void 0 ? _a : {});
    })
        .catch((err) => Promise.reject(err));
}
async function getEmbyMusicInfo(musicId) {
    return await embyService
        .get(`/emby/UserGetItem/${musicId}`)
        .then((resp) => {
        var _a;
        return Promise.resolve((_a = resp.data) !== null && _a !== void 0 ? _a : {});
    })
        .catch((err) => Promise.reject(err));
}
async function reportEmbyMusicStartPlay(musicId) {
    return await embyService
        .post("/emby/Sessions/Playing", {
        ItemId: musicId,
        PlayMethod: "Direct",
        PlaySessionId: new Date().toString(),
    })
        .then((resp) => {
        var _a;
        return Promise.resolve((_a = resp.data) !== null && _a !== void 0 ? _a : {});
    })
        .catch((err) => {
        return Promise.reject(err);
    });
}
function formatEmbyPlaylistItem(playlistItem, username) {
    var _a, _b, _c;
    return {
        id: playlistItem.Id,
        artist: username,
        title: playlistItem.Name,
        artwork: getEmbyCoverArtUrl(playlistItem),
        playCount: (_b = (_a = playlistItem.UserData) === null || _a === void 0 ? void 0 : _a.PlayCount) !== null && _b !== void 0 ? _b : 0,
        createTime: playlistItem.DateCreated,
        description: (_c = playlistItem.Overview) !== null && _c !== void 0 ? _c : "",
    };
}
function formatEmbyAlbumItem(playlistItem) {
    var _a, _b, _c;
    return {
        id: playlistItem.Id,
        artist: playlistItem.AlbumArtist,
        title: playlistItem.Name,
        artwork: getEmbyCoverArtUrl(playlistItem),
        playCount: (_b = (_a = playlistItem.UserData) === null || _a === void 0 ? void 0 : _a.PlayCount) !== null && _b !== void 0 ? _b : 0,
        createTime: playlistItem.DateCreated,
        description: (_c = playlistItem.Overview) !== null && _c !== void 0 ? _c : "",
    };
}
function formatEmbyMusicItem(musicItem) {
    var _a, _b;
    return {
        id: musicItem.Id,
        title: musicItem.Name,
        artist: (_b = (_a = musicItem.Artists) === null || _a === void 0 ? void 0 : _a.join("&")) !== null && _b !== void 0 ? _b : "",
        artwork: getEmbyCoverArtUrl(musicItem),
        album: musicItem.Album,
        albumid: musicItem.AlbumId,
        duration: musicItem.RunTimeTicks / 10000000,
    };
}
function getEmbyCoverArtUrl(item) {
    var _a, _b, _c, _d;
    let imgId, imgTag;
    if (((_b = (_a = item.ImageTags) === null || _a === void 0 ? void 0 : _a.Primary) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        imgId = item.Id;
        imgTag = item.ImageTags.Primary;
    }
    else {
        imgId = (_c = item.PrimaryImageItemId) !== null && _c !== void 0 ? _c : "";
        imgTag = (_d = item.PrimaryImageTag) !== null && _d !== void 0 ? _d : "";
    }
    const urlObj = new URL(getConfigEmbyBaseUrl());
    urlObj.pathname = `/emby/Items/${imgId}/Images/Primary`;
    urlObj.searchParams.append("tag", imgTag);
    urlObj.searchParams.append("maxHeight", "300");
    urlObj.searchParams.append("maxWidth", "300");
    urlObj.searchParams.append("quality", "90");
    return urlObj.toString();
}
module.exports = {
    platform: EMBY_PLUGIN_NAME,
    version: EMBY_PLUGIN_VERSION,
    author: "猪小乐",
    appVersion: ">0.1.0-alpha.0",
    srcUrl: "https://registry.npmmirror.com/musicfree-plugins/latest/files/emby/index.js",
    cacheControl: "no-cache",
    userVariables: [
        {
            key: "url",
            name: "服务器地址",
        },
        {
            key: "username",
            name: "用户名",
        },
        {
            key: "password",
            name: "密码",
        },
    ],
    supportedSearchType: ["music"],
    async getMediaSource(musicItem, quality) {
        var _a;
        const baseUrl = getConfigEmbyBaseUrl();
        const deviceId = await checkAndGetEmbyDeviceId(baseUrl);
        if (!isEmbyAuthInfoValid(await getStoredEmbyAuthInfo(baseUrl))) {
            await requestEmbyToken();
        }
        const authInfo = await getStoredEmbyAuthInfo(baseUrl);
        const urlObj = new URL(baseUrl);
        urlObj.pathname = `/emby/Audio/${musicItem.id}/universal`;
        urlObj.searchParams.append("X-Emby-Token", (_a = authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyToken) !== null && _a !== void 0 ? _a : "");
        urlObj.searchParams.append("UserId", (await getStoredEmbyAuthInfo(baseUrl)).embyUserId);
        urlObj.searchParams.append("X-Emby-Device-Id", deviceId);
        urlObj.searchParams.append("X-Emby-Device-Name", EMBY_DEVICE_NAME);
        urlObj.searchParams.append("X-Emby-Client", `MusicFree-${EMBY_PLUGIN_NAME}-Plugin`);
        urlObj.searchParams.append("X-Emby-Client-Version", EMBY_PLUGIN_VERSION);
        urlObj.searchParams.append("Container", "opus,mp3|mp3,mp2,mp3|mp2,aac|aac,m4a|aac,mp4|aac,flac,webma,webm,wav|PCM_S16LE,wav|PCM_S24LE,ogg");
        urlObj.searchParams.append("TranscodingContainer", "aac");
        urlObj.searchParams.append("TranscodingProtocol", "hls");
        urlObj.searchParams.append("AudioCodec", "aac");
        urlObj.searchParams.append("EnableRedirection", "true");
        urlObj.searchParams.append("EnableRemoteMedia", "false");
        return {
            url: urlObj.toString(),
        };
    },
    async getMusicInfo(musicItem) {
        await reportEmbyMusicStartPlay(musicItem.id);
        return musicItem;
    },
    async getLyric(musicItem) {
        var _a, _b;
        const data = await getEmbyMusicInfo(musicItem.id);
        const streams = data.MediaStreams;
        return {
            rawLrc: (_b = (_a = streams === null || streams === void 0 ? void 0 : streams.filter((it) => it.Codec === "text")) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.Extradata,
        };
    },
    async getRecommendSheetTags() {
        var _a, _b;
        const musicLibsRequest = getEmbyUserMusicLibraries();
        const genresRequest = getEmbyMusicGenres(30);
        const data = await Promise.all([musicLibsRequest, genresRequest]);
        const libsData = (_a = data === null || data === void 0 ? void 0 : data[0]) === null || _a === void 0 ? void 0 : _a.map((it) => ({
            id: it.Id,
            title: it.Name,
        }));
        const genresData = (_b = data === null || data === void 0 ? void 0 : data[1]) === null || _b === void 0 ? void 0 : _b.map((it) => ({
            id: it.Id,
            title: it.Name,
            type: "genre",
        }));
        return {
            pinned: libsData,
            data: [
                {
                    title: "媒体库",
                    data: libsData,
                },
                {
                    title: "风格",
                    data: genresData,
                },
            ],
        };
    },
    async getRecommendSheetsByTag(tagItem, page) {
        let sheets = null;
        if (!tagItem || tagItem.id.length <= 0) {
            const username = getConfigEmbyUsername();
            sheets = await getEmbyUserMusicPlaylist(page);
            sheets = sheets === null || sheets === void 0 ? void 0 : sheets.map((it) => formatEmbyPlaylistItem(it, username));
        }
        else if (tagItem.type === "genre") {
            sheets = await getEmbyAlbumsByGenre(tagItem.id, page);
            sheets = sheets === null || sheets === void 0 ? void 0 : sheets.map(formatEmbyAlbumItem);
        }
        else {
            sheets = await getEmbyAlbumsByParent(tagItem.id, page);
            sheets = sheets === null || sheets === void 0 ? void 0 : sheets.map(formatEmbyAlbumItem);
        }
        return {
            isEnd: sheets == null ? true : sheets.length < EMBY_PAGE_SIZE,
            data: sheets,
        };
    },
    async getMusicSheetInfo(sheetItem, page) {
        var _a, _b, _c;
        const sheetInfo = await getEmbyMusicListByParent(sheetItem.id, page);
        const musicList = (_a = sheetInfo.Items) === null || _a === void 0 ? void 0 : _a.map(formatEmbyMusicItem);
        return {
            isEnd: (_b = musicList === null || musicList === void 0 ? void 0 : musicList.length) !== null && _b !== void 0 ? _b : 0 < EMBY_PAGE_SIZE,
            musicList: musicList,
            sheetItem: {
                worksNums: (_c = sheetInfo.TotalRecordCount) !== null && _c !== void 0 ? _c : 0,
            },
        };
    },
};
