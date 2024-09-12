import config from "../config.json";
import pluginInfo from "./emby.json";
const embyAxios = require("axios");
import uuid from "react-native-uuid";
import storeManager from "../../common/storeManager";

// 唯一token请求
let embySingletonTokenRequest = null;
// 唯一检查deviceId的处理
let embyCheckDeviceIdRequest = null;

function genDefaultEmbyAuthInfo(): EmbyAuthInfo {
  return {
    embyBaseUrl: "",
    embyUserId: "",
    embyUsername: "",
    embyToken: "",
  };
}

function genEmbyAuthInfoFromLoginResp(baseUrl, loginResp): EmbyAuthInfo {
  return {
    embyBaseUrl: baseUrl ?? "",
    embyUserId: loginResp?.User?.Id ?? "",
    embyUsername: loginResp?.User?.Name ?? "",
    embyToken: loginResp?.AccessToken ?? "",
  };
}

async function storeEmbyAuthInfo(baseUrl, authInfo: EmbyAuthInfo) {
  const storeAuthInfo = {
    embyBaseUrl: authInfo?.embyBaseUrl ?? "",
    embyUserId: authInfo?.embyUserId ?? "",
    embyUsername: authInfo?.embyUsername ?? "",
    embyToken: authInfo?.embyToken ?? "",
  };

  await storeManager.set(
    baseUrl,
    "embyAuthInfo",
    JSON.stringify(storeAuthInfo)
  );
}

async function storeEmbyDeviceId(baseUrl, deviceId: string) {
  const storeDeviceId = env?.debug
    ? "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    : deviceId;

  await storeManager.set(baseUrl, "embyDeviceId", storeDeviceId);
}

async function getStoredEmbyDeviceId(baseUrl) {
  return await storeManager.get(baseUrl, "embyDeviceId");
}

async function getStoredEmbyAuthInfo(baseUrl) {
  const authInfoStr = await storeManager.get(baseUrl, "embyAuthInfo");
  return authInfoStr?.length > 0 ? JSON.parse(authInfoStr) : null;
}

async function resetStoredEmbyAuthInfo(baseUrl) {
  await storeManager.remove(baseUrl, "embyAuthInfo");
}

function getEmbyUserVariables() {
  let userVariables = env?.getUserVariables() ?? {};
  if (
    !userVariables?.url?.startsWith("http://") &&
    !userVariables?.url?.startsWith("https://")
  ) {
    userVariables.url = `http://${userVariables.url}`;
  }
  return userVariables;
}

function getConfigEmbyBaseUrl() {
  return getEmbyUserVariables()?.url?.trim() ?? "";
}

function getConfigEmbyUsername() {
  return getEmbyUserVariables()?.username?.trim() ?? "";
}

function getConfigEmbyPassword() {
  return getEmbyUserVariables()?.password?.trim() ?? "";
}

function isEmbyAuthInfoValid(info: EmbyAuthInfo) {
  return (
    info &&
    info.embyUserId &&
    info.embyUserId.length > 0 &&
    info.embyUsername &&
    info.embyUsername.length > 0 &&
    info.embyToken &&
    info.embyToken.length > 0
  );
}

function isEmbyLoginUrl(baseUrl, url) {
  return (
    baseUrl &&
    baseUrl === getConfigEmbyBaseUrl() &&
    url &&
    url.startsWith("/emby/Users/AuthenticateByName")
  );
}

function isEmbyUrl(baseUrl, url) {
  return (
    isEmbyLoginUrl(baseUrl, url) ||
    (baseUrl &&
      baseUrl === getConfigEmbyBaseUrl() &&
      url &&
      url.startsWith("/emby"))
  );
}

// axios实例
const embyService = embyAxios.create({
  timeout: 30000,
  headers: { "User-Agent": config.userAgent },
});

// 请求拦截器
embyService.interceptors.request.use(
  async function (config) {
    config.baseURL = config.baseURL ?? getConfigEmbyBaseUrl();

    if (config.method === "post") {
      config.headers["Content-Type"] = "application/json;charset=utf-8";
    }

    const ifLoginUrl = isEmbyLoginUrl(config.baseURL, config.url);
    const ifEmbyUrl = isEmbyUrl(config.baseURL, config.url);

    if (ifEmbyUrl) {
      const deviceId = await checkAndGetEmbyDeviceId(config.baseURL);

      const authInfoClinet = `Emby Client=MusicFree-${pluginInfo.pluginName}-Plugin`;
      const authInfoDevice = `Device=${config.appName}`;
      const authInfoDeviceId = `DeviceId=${deviceId}`;
      const authInfoVersion = `Version=${pluginInfo.pluginVersion}`;
      let authHeader = `${authInfoClinet}, ${authInfoDevice}, ${authInfoDeviceId}, ${authInfoVersion}`;

      if (!ifLoginUrl) {
        let authInfo = await getStoredEmbyAuthInfo(config.baseURL);

        // 如果用户配置的url或者用户名与cookie存储的不同，则清除cookie存储的认证信息
        const baseURLHost = config.baseURL
          ? new URL(config.baseURL).host
          : null;
        const storedBaseURLHost = authInfo?.embyBaseUrl
          ? new URL(authInfo?.embyBaseUrl).host
          : null;

        if (
          (storedBaseURLHost?.length > 0 &&
            baseURLHost !== storedBaseURLHost) ||
          (authInfo?.embyUsername?.length > 0 &&
            getConfigEmbyUsername() !== authInfo?.embyUsername)
        ) {
          await resetStoredEmbyAuthInfo(config.baseURL);
          authInfo = null;
        }

        if (!isEmbyAuthInfoValid(authInfo)) {
          // 请求token
          await requestEmbyToken();
          authInfo = await getStoredEmbyAuthInfo(config.baseURL);
        }

        if (isEmbyAuthInfoValid(authInfo)) {
          // 设置头部 token
          authHeader = `Emby UserId=${authInfo.embyUserId}, ${authHeader}`;
          config.headers["X-Emby-Token"] = authInfo.embyToken;

          // /emby/MusicViews 设置 userId
          if (config.url && config.url.startsWith("/emby/UserItems")) {
            config.url = `/emby/Users/${authInfo.embyUserId}/Items`;
          }

          // /emby/UserGetItem 设置 userId
          if (config.url && config.url.startsWith("/emby/UserGetItem")) {
            config.url = `/emby/Users/${authInfo.embyUserId}/Items/${config.url
              .split("/")
              .pop()}`;
          }
        }
      }

      // 设置 Authorization 头
      config.headers["Authorization"] = authHeader;
    }
    return Promise.resolve(config);
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
embyService.interceptors.response.use(
  async function (response) {
    return Promise.resolve(response);
  },
  async function (error: any) {
    if (error?.response?.status === 401) {
      const ifEmbyUrl = isEmbyUrl(error.config.baseURL, error.config.url);

      // token 失效处理
      if (ifEmbyUrl) {
        if (!isEmbyLoginUrl(error.config.baseURL, error.config.url)) {
          // 1. 刷新 token
          await requestEmbyToken();
          const authInfo = await getStoredEmbyAuthInfo(error.config.baseURL);
          if (isEmbyAuthInfoValid(authInfo)) {
            // token 有效，重新请求
            return await embyService.request(error.config);
          }
        }
        await resetStoredEmbyAuthInfo(error.config.baseURL);
      }
    }
    return Promise.reject(error);
  }
);

function checkAndGetEmbyDeviceId(baseUrl: string): Promise<string> {
  // 如果 embyCheckDeviceIdRequest 不为 null 说明已经在检查中，直接返回
  if (embyCheckDeviceIdRequest !== null) {
    return embyCheckDeviceIdRequest;
  }

  embyCheckDeviceIdRequest = new Promise<string>(async function (
    resolve,
    reject
  ) {
    try {
      let deviceId = await getStoredEmbyDeviceId(baseUrl);
      if (!deviceId || deviceId.length <= 0) {
        deviceId = uuid.v4().toString();
        await storeEmbyDeviceId(baseUrl, deviceId);
      }
      resolve(deviceId);
    } catch (err) {
      reject(err);
    }
  });

  // 最终将 embyCheckDeviceIdRequest 设置为 null, 防止 embyCheckDeviceIdRequest 一直占用
  embyCheckDeviceIdRequest.finally(() => {
    embyCheckDeviceIdRequest = null;
  });

  return embyCheckDeviceIdRequest;
}

function requestEmbyToken(): Promise<any> {
  // 如果 embySingletonTokenRequest 不为 null 说明已经在刷新中，直接返回
  if (embySingletonTokenRequest !== null) {
    return embySingletonTokenRequest;
  }

  const username = getConfigEmbyUsername();
  const password = getConfigEmbyPassword();

  // 设置 embySingletonTokenRequest 为一个 Promise 对象 , 处理刷新 token 请求
  embySingletonTokenRequest = new Promise<any>(async function (
    resolve,
    reject
  ) {
    const baseUrl = getConfigEmbyBaseUrl();
    await embyService
      .post("/emby/Users/AuthenticateByName", {
        Username: username,
        Pw: password,
      })
      .then(async function ({ data }) {
        // 存储Token
        try {
          await storeEmbyAuthInfo(
            baseUrl,
            genEmbyAuthInfoFromLoginResp(baseUrl, data)
          );
          resolve(data);
        } catch (err) {
          reject(err);
        }
      })
      .catch(async function (err) {
        try {
          await resetStoredEmbyAuthInfo(baseUrl);
        } finally {
          reject(err);
        }
      });
  });

  // 最终将 embySingletonTokenRequest 设置为 null, 防止 embySingletonTokenRequest 一直占用
  embySingletonTokenRequest.finally(() => {
    embySingletonTokenRequest = null;
  });

  return embySingletonTokenRequest;
}

// 获取 Emby 音乐风格列表
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
      return Promise.resolve(resp.data?.Items ?? []);
    })
    .catch((err) => Promise.reject(err));
}

// 获取 Emby 用户音乐类型的媒体库
async function getEmbyUserMusicLibraries() {
  return await embyService
    .get("/emby/UserItems")
    .then((resp) => {
      return Promise.resolve(
        resp.data?.Items?.filter((it) => it.CollectionType === "music") ?? []
      );
    })
    .catch((err) => Promise.reject(err));
}

// 获取 Emby 用户歌单列表
async function getEmbyUserMusicPlaylist(page) {
  return await embyService
    .get("/emby/UserItems", {
      params: {
        StartIndex: (page - 1) * config.pageSize,
        Limit: config.pageSize,
        IncludeItemTypes: "Playlist",
        Tags: "music", // 只获取音乐歌单
        Recursive: true,
        EnableUserData: true,
        EnableImageTypes: "Primary",
        Fields: "BasicSyncInfo,Overview,DateCreated",
      },
    })
    .then((resp) => {
      return Promise.resolve(resp.data?.Items ?? []);
    })
    .catch((err) => Promise.reject(err));
}

// Emby 根据风格类型获取专辑列表
async function getEmbyAlbumsByGenre(genreId, page) {
  return await embyService
    .get("/emby/UserItems", {
      params: {
        StartIndex: (page - 1) * config.pageSize,
        Limit: config.pageSize,
        IncludeItemTypes: "MusicAlbum",
        Recursive: true,
        GenreIds: genreId,
        EnableUserData: true,
        EnableImageTypes: "Primary",
        Fields: "BasicSyncInfo,Overview,ProductionYear,DateCreated",
      },
    })
    .then((resp) => {
      return Promise.resolve(resp.data?.Items ?? []);
    })
    .catch((err) => Promise.reject(err));
}

// Emby 根据 parentId 获取专辑列表
async function getEmbyAlbumsByParent(parentId, page) {
  return await embyService
    .get("/emby/UserItems", {
      params: {
        StartIndex: (page - 1) * config.pageSize,
        Limit: config.pageSize,
        IncludeItemTypes: "MusicAlbum",
        Recursive: true,
        ParentId: parentId,
        EnableUserData: true,
        EnableImageTypes: "Primary",
        Fields: "BasicSyncInfo,Overview,ProductionYear,DateCreated",
      },
    })
    .then((resp) => {
      return Promise.resolve(resp.data?.Items ?? []);
    })
    .catch((err) => Promise.reject(err));
}

// Emby 根据 parentId 获取歌曲列表
async function getEmbyMusicListByParent(parentId, page) {
  return await embyService
    .get("/emby/UserItems", {
      params: {
        StartIndex: (page - 1) * config.pageSize,
        Limit: config.pageSize,
        ParentId: parentId,
        MediaTypes: "Audio",
        EnableUserData: true,
        EnableImageTypes: "Primary",
        Fields: "BasicSyncInfo,Overview,ProductionYear,DateCreated",
      },
    })
    .then((resp) => {
      return Promise.resolve(resp.data ?? {});
    })
    .catch((err) => Promise.reject(err));
}

async function getEmbyMusicInfo(musicId) {
  // 会经过拦截器重新拼接url
  return await embyService
    .get(`/emby/UserGetItem/${musicId}`)
    .then((resp) => {
      return Promise.resolve(resp.data ?? {});
    })
    .catch((err) => Promise.reject(err));
}

async function reportEmbyMusicStartPlay(musicId: string) {
  return await embyService
    .post("/emby/Sessions/Playing", {
      ItemId: musicId,
      PlayMethod: "Direct",
      PlaySessionId: new Date().toString(),
    })
    .then((resp) => {
      return Promise.resolve(resp.data ?? {});
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function formatEmbyPlaylistItem(playlistItem, username) {
  return {
    id: playlistItem.Id,
    artist: username,
    title: playlistItem.Name,
    artwork: getEmbyCoverArtUrl(playlistItem),
    playCount: playlistItem.UserData?.PlayCount ?? 0,
    createTime: playlistItem.DateCreated,
    description: playlistItem.Overview ?? "",
  };
}

function formatEmbyAlbumItem(playlistItem) {
  return {
    id: playlistItem.Id,
    artist: playlistItem.AlbumArtist,
    title: playlistItem.Name,
    artwork: getEmbyCoverArtUrl(playlistItem),
    playCount: playlistItem.UserData?.PlayCount ?? 0,
    createTime: playlistItem.DateCreated,
    description: playlistItem.Overview ?? "",
  };
}

function formatEmbyMusicItem(musicItem) {
  return {
    id: musicItem.Id,
    title: musicItem.Name,
    artist: musicItem.Artists?.join("&") ?? "",
    artwork: getEmbyCoverArtUrl(musicItem),
    album: musicItem.Album,
    albumid: musicItem.AlbumId,
    duration: musicItem.RunTimeTicks / 10000000,
  };
}

function getEmbyCoverArtUrl(item) {
  let imgId: string, imgTag: string;

  if (item.ImageTags?.Primary?.length > 0) {
    imgId = item.Id;
    imgTag = item.ImageTags.Primary;
  } else {
    imgId = item.PrimaryImageItemId ?? "";
    imgTag = item.PrimaryImageTag ?? "";
  }

  const urlObj = new URL(getConfigEmbyBaseUrl());
  urlObj.pathname = `/emby/Items/${imgId}/Images/Primary`;
  urlObj.searchParams.append("tag", imgTag);
  urlObj.searchParams.append("maxHeight", "300");
  urlObj.searchParams.append("maxWidth", "300");
  urlObj.searchParams.append("quality", "90");
  return urlObj.toString();
}

type EmbyAuthInfo = {
  embyBaseUrl: string;
  embyUserId: string;
  embyUsername: string;
  embyToken: string;
};

module.exports = {
  platform: pluginInfo.pluginName,
  version: pluginInfo.pluginVersion,
  author: config.author,
  appVersion: pluginInfo.appVersion,
  srcUrl: pluginInfo.srcUrl,
  cacheControl: pluginInfo.cacheControl,
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
  // 获取歌曲播放流
  async getMediaSource(musicItem, quality) {
    const baseUrl = getConfigEmbyBaseUrl();
    const deviceId = await checkAndGetEmbyDeviceId(baseUrl);
    if (!isEmbyAuthInfoValid(await getStoredEmbyAuthInfo(baseUrl))) {
      await requestEmbyToken();
    }
    const authInfo = await getStoredEmbyAuthInfo(baseUrl);
    const urlObj = new URL(baseUrl);
    urlObj.pathname = `/emby/Audio/${musicItem.id}/universal`;
    urlObj.searchParams.append("X-Emby-Token", authInfo?.embyToken ?? "");
    urlObj.searchParams.append(
      "UserId",
      (await getStoredEmbyAuthInfo(baseUrl)).embyUserId
    );
    urlObj.searchParams.append("X-Emby-Device-Id", deviceId);
    urlObj.searchParams.append("X-Emby-Device-Name", config.appName);
    urlObj.searchParams.append(
      "X-Emby-Client",
      `MusicFree-${pluginInfo.pluginName}-Plugin`
    );
    urlObj.searchParams.append(
      "X-Emby-Client-Version",
      pluginInfo.pluginVersion
    );
    urlObj.searchParams.append(
      "Container",
      "opus,mp3|mp3,mp2,mp3|mp2,aac|aac,m4a|aac,mp4|aac,flac,webma,webm,wav|PCM_S16LE,wav|PCM_S24LE,ogg"
    );
    urlObj.searchParams.append("TranscodingContainer", "aac");
    urlObj.searchParams.append("TranscodingProtocol", "hls");
    urlObj.searchParams.append("AudioCodec", "aac");
    urlObj.searchParams.append("EnableRedirection", "true");
    urlObj.searchParams.append("EnableRemoteMedia", "false");

    return {
      url: urlObj.toString(),
    };
  },
  // 获取歌曲详情
  async getMusicInfo(musicItem) {
    // 播放记录
    await reportEmbyMusicStartPlay(musicItem.id);

    return musicItem;
  },
  // 获取歌词
  async getLyric(musicItem) {
    const data = await getEmbyMusicInfo(musicItem.id);
    const streams = data.MediaStreams;

    return {
      rawLrc: streams?.filter((it) => it.Codec === "text")?.[0]?.Extradata,
    };
  },
  // 获取推荐歌单标签
  async getRecommendSheetTags() {
    const musicLibsRequest = getEmbyUserMusicLibraries();
    const genresRequest = getEmbyMusicGenres(30);
    const data = await Promise.all([musicLibsRequest, genresRequest]);

    const libsData = data?.[0]?.map((it) => ({
      id: it.Id,
      title: it.Name,
    }));

    const genresData = data?.[1]?.map((it) => ({
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
  // 获取推荐歌单
  async getRecommendSheetsByTag(tagItem, page) {
    let sheets = null;
    if (!tagItem || tagItem.id.length <= 0) {
      const username = getConfigEmbyUsername();
      sheets = await getEmbyUserMusicPlaylist(page);
      sheets = sheets?.map((it) => formatEmbyPlaylistItem(it, username));
    } else if (tagItem.type === "genre") {
      sheets = await getEmbyAlbumsByGenre(tagItem.id, page);
      sheets = sheets?.map(formatEmbyAlbumItem);
    } else {
      sheets = await getEmbyAlbumsByParent(tagItem.id, page);
      sheets = sheets?.map(formatEmbyAlbumItem);
    }

    return {
      isEnd: sheets == null ? true : sheets.length < config.pageSize,
      data: sheets,
    };
  },
  // 获取歌单详情
  async getMusicSheetInfo(sheetItem, page) {
    const sheetInfo = await getEmbyMusicListByParent(sheetItem.id, page);
    const musicList = sheetInfo.Items?.map(formatEmbyMusicItem);

    return {
      isEnd: musicList?.length ?? 0 < config.pageSize,
      musicList: musicList,
      sheetItem: {
        worksNums: sheetInfo.TotalRecordCount ?? 0,
      },
    };
  },
};
