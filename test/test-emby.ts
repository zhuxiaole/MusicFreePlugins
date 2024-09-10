const embyTest = require("./test-user-vars.json");

/// <reference types="../types/global" />
global.env = {
  getUserVariables: () => {
    return {
      url: embyTest.emby.url,
      username: embyTest.emby.username,
      password: embyTest.emby.password,
    };
  },
  debug: true,
};

const emby = require("../plugins/emby/index");

emby.getRecommendSheetTags().then((tags) => {
  console.log(tags);
});
