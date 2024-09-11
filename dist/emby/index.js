'use strict';

const toHex = [];
for (let i = 0; i < 256; ++i) {
    toHex[i] = (i + 0x100).toString(16).substr(1);
}
class Guid {
    constructor(str) {
        this.DASH = "-";
        this.DASH_REGEXP = /-/g;
        this.contentStr = str;
        this.contentInt = this.getNumberFromGuidString();
        if (!this.isValid()) {
            this.contentStr = Guid.emptyStr;
            this.contentInt = -1;
        }
    }
    static empty() {
        return new Guid();
    }
    static newGuid(generator) {
        return new Guid(this.generate(generator));
    }
    static isValid(str) {
        if (str) {
            return Guid.patternV4.test(str);
        }
        return false;
    }
    isValid() {
        if (this.contentStr) {
            return Guid.patternV4.test(this.contentStr);
        }
        return false;
    }
    isEmpty() {
        return this.contentStr === Guid.emptyStr;
    }
    equals(otherGuid) {
        return (otherGuid &&
            !!this.contentStr &&
            otherGuid.toString().toLowerCase() === this.contentStr.toLowerCase());
    }
    toString() {
        var _a;
        return (_a = this.contentStr) !== null && _a !== void 0 ? _a : "";
    }
    toNumber() {
        var _a;
        return (_a = this.contentInt) !== null && _a !== void 0 ? _a : -1;
    }
    getNumberFromGuidString() {
        if (!this.contentStr || this.contentStr.indexOf(this.DASH) === -1) {
            return -1;
        }
        return Number("0x" + this.contentStr.replace(this.DASH_REGEXP, ""));
    }
    static generate(generator) {
        const val = Guid.generateRandomBytes(generator);
        return (toHex[val[0]] +
            toHex[val[1]] +
            toHex[val[2]] +
            toHex[val[3]] +
            "-" +
            toHex[val[4]] +
            toHex[val[5]] +
            "-" +
            toHex[val[6]] +
            toHex[val[7]] +
            "-" +
            toHex[val[8]] +
            toHex[val[9]] +
            "-" +
            toHex[val[10]] +
            toHex[val[11]] +
            toHex[val[12]] +
            toHex[val[13]] +
            toHex[val[14]] +
            toHex[val[15]]);
    }
    static generateRandomBytes(generator) {
        const cryptoObj = Guid.getCryptoImplementation();
        if (typeof generator !== "undefined") {
            return Guid.getCryptoRandomBytes(generator);
        }
        else if (typeof cryptoObj !== "undefined") {
            return Guid.getCryptoRandomBytes(cryptoObj);
        }
        else {
            return Guid.getRandomBytes();
        }
    }
    static getCryptoRandomBytes(crypto) {
        const val = crypto.getRandomValues(new Uint8Array(16));
        Guid.setSpecialBytesForV4Guid(val);
        return val;
    }
    static getRandomBytes() {
        let val = new Uint8Array(16);
        val = val.map(() => {
            return (Math.random() * Guid.MAX_UINT_8) | 0;
        });
        Guid.setSpecialBytesForV4Guid(val);
        return val;
    }
    static setSpecialBytesForV4Guid(arr) {
        arr[6] = (arr[6] & 0x0f) | 0x40;
        arr[8] = (arr[8] & 0x3f) | 0x80;
    }
    static getCryptoImplementation() {
        if (typeof window === "undefined") {
            return undefined;
        }
        return window.crypto || window.msCrypto;
    }
}
Guid.patternV4 = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89ab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;
Guid.emptyStr = "00000000-0000-0000-0000-000000000000";
Guid.MAX_UINT_8 = 255;

const embyAxios = require("axios");
const embyCookieManager = !(env === null || env === void 0 ? void 0 : env.debug)
    ? require("@react-native-cookies/cookies")
    : null;
const EMBY_DEVICE_NAME = "MusicFree";
const EMBY_PLUGIN_NAME = "Emby";
const EMBY_PLUGIN_VERSION = "0.0.1";
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
function storeEmbyAuthInfo(baseUrl, authInfo) {
    var _a, _b, _c, _d;
    if (!embyCookieManager) {
        return new Promise((resolve, reject) => {
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
        return Promise.all([
            embyBaseUrlStore,
            embyUserIdStore,
            embyUsernameStore,
            embyTokenStore,
        ]);
    }
}
function storeEmbyDeviceId(baseUrl, deviceId) {
    if (!embyCookieManager) {
        return new Promise((resolve, reject) => {
            try {
                resolve("success");
            }
            catch (err) {
                reject(err);
            }
        });
    }
    else {
        return embyCookieManager.set(baseUrl, {
            name: "embyDeviceId",
            value: deviceId,
        });
    }
}
function getStoredEmbyDeviceId(baseUrl) {
    if (!embyCookieManager) {
        return new Promise((resolve) => {
            resolve(embyDebugDeviceId);
        });
    }
    else {
        return embyCookieManager.get(baseUrl).then((cookies) => {
            var _a;
            return Promise.resolve((_a = cookies.embyDeviceId) === null || _a === void 0 ? void 0 : _a.value);
        });
    }
}
function getStoredEmbyAuthInfo(baseUrl) {
    if (!embyCookieManager) {
        return new Promise((resolve) => {
            resolve(embyDebugAuthInfo);
        });
    }
    else {
        return embyCookieManager.get(baseUrl).then((cookies) => {
            var _a, _b, _c, _d;
            return Promise.resolve({
                embyBaseUrl: (_a = cookies.embyBaseUrl) === null || _a === void 0 ? void 0 : _a.value,
                embyUserId: (_b = cookies.embyUserId) === null || _b === void 0 ? void 0 : _b.value,
                embyUsername: (_c = cookies.embyUsername) === null || _c === void 0 ? void 0 : _c.value,
                embyToken: (_d = cookies.embyToken) === null || _d === void 0 ? void 0 : _d.value,
            });
        });
    }
}
function resetStoredEmbyAuthInfo(baseUrl) {
    return storeEmbyAuthInfo(baseUrl, genDefaultEmbyAuthInfo());
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
    var _a;
    return (_a = getEmbyUserVariables()) === null || _a === void 0 ? void 0 : _a.url;
}
function getConfigEmbyUsername() {
    var _a;
    return (_a = getEmbyUserVariables()) === null || _a === void 0 ? void 0 : _a.username;
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
    var _a;
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
            if (baseURLHost !== storedBaseURLHost ||
                getConfigEmbyUsername() !== (authInfo === null || authInfo === void 0 ? void 0 : authInfo.embyUsername)) {
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
            if (!deviceId || deviceId.length < 0) {
                deviceId = Guid.newGuid().toString();
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
    let { _, username, password } = getEmbyUserVariables();
    embySingletonTokenRequest = new Promise(async function (resolve, reject) {
        const baseUrl = getConfigEmbyBaseUrl();
        await embyService
            .post("/emby/Users/AuthenticateByName", {
            Username: username,
            Pw: password,
        })
            .then(({ data }) => {
            storeEmbyAuthInfo(baseUrl, genEmbyAuthInfoFromLoginResp(baseUrl, data))
                .then(() => {
                resolve(data);
            })
                .catch((cErr) => {
                reject(cErr);
            });
        })
            .catch((err) => {
            resetStoredEmbyAuthInfo(baseUrl).finally(() => {
                reject(err);
            });
        });
    });
    embySingletonTokenRequest.finally(() => {
        embySingletonTokenRequest = null;
    });
    return embySingletonTokenRequest;
}
function getEmbyMusicGenres(size) {
    return embyService
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
    });
}
function getEmbyUserMusicLibraries() {
    return embyService.get("/emby/UserItems").then((resp) => {
        var _a, _b, _c;
        return Promise.resolve((_c = (_b = (_a = resp.data) === null || _a === void 0 ? void 0 : _a.Items) === null || _b === void 0 ? void 0 : _b.filter((it) => it.CollectionType === "music")) !== null && _c !== void 0 ? _c : []);
    });
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
    async getRecommendSheetTags() {
        var _a, _b;
        const musicLibsRequest = getEmbyUserMusicLibraries();
        const generesRequest = getEmbyMusicGenres(30);
        const data = await Promise.all([musicLibsRequest, generesRequest]);
        const libsData = (_a = data[0]) === null || _a === void 0 ? void 0 : _a.map((it) => ({
            id: it.Id,
            title: it.Name,
        }));
        const generesData = (_b = data[1]) === null || _b === void 0 ? void 0 : _b.map((it) => ({
            id: it.Id,
            title: it.Name,
            type: "genere",
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
                    data: generesData,
                },
            ],
        };
    },
    async getRecommendSheetsByTag(tagItem, page) {
        return {
            isEnd: true,
            data: [],
        };
    },
};
