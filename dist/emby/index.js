'use strict';

let _byteToHex = [];
for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substring(1);
}
const byteToHex = _byteToHex;

const unparse = (buf, offset) => {
    let i = 0;
    let bth = byteToHex;
    return (bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        "-" +
        bth[buf[i++]] +
        bth[buf[i++]] +
        "-" +
        bth[buf[i++]] +
        bth[buf[i++]] +
        "-" +
        bth[buf[i++]] +
        bth[buf[i++]] +
        "-" +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]] +
        bth[buf[i++]]);
};

const min = 0;
const max = 256;
const RANDOM_LENGTH = 16;
const rng = () => {
    let result = new Array(RANDOM_LENGTH);
    for (let j = 0; j < RANDOM_LENGTH; j++) {
        result[j] = 0xff & (Math.random() * (max - min) + min);
    }
    return result;
};

function v4(options, buf, offset) {
    let i = (buf && offset) || 0;
    let rnds = rng();
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        for (var ii = 0; ii < 16; ii++) {
            buf[i + ii] = rnds[ii];
        }
    }
    return buf || unparse(rnds);
}

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
                deviceId = v4();
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
        await reportEmbyMusicStartPlay(musicItem.id);
        return {
            url: urlObj.toString(),
        };
    },
    async getMusicInfo(musicItem) {
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
