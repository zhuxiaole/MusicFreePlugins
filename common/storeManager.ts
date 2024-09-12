const embyCookieManager = !env?.debug
  ? require("@react-native-cookies/cookies")
  : null;

const memoryStorage = {};

const storeManager = {
  set: async function (namespace: string, key: string, value: string) {
    if (embyCookieManager) {
      await embyCookieManager.set(namespace, {
        name: key,
        value: value ?? "",
      });
    } else {
      memoryStorage[`${namespace ?? ""}_${key}`] = value;
    }
  },
  get: async function (namespace: string, key: string) {
    if (embyCookieManager) {
      const value = (await embyCookieManager.get(namespace))?.[key]?.value;
      return value ?? "";
    } else {
      return memoryStorage[`${namespace ?? ""}_${key}`];
    }
  },
  remove: async function (namespace: string, key: string) {
    if (embyCookieManager) {
      await embyCookieManager.set(namespace, {
        name: key,
        value: "",
      });
    } else {
      delete memoryStorage[`${namespace ?? ""}_${key}`];
    }
  },
};

export default storeManager;
