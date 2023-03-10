"use strict";
const default_avatar = "https://i2.hdslb.com/bfs/face/eaa74bee5a7a0bb937b7128f8b31f4fcf1353e3b.jpg@160w_160h_1c_1s.webp";
const server = "http://localhost";
const port = 4e3;
const socketPath = "/socket";
const files = "/files";
const empty_image = {
  name: "empty_image",
  extname: "webp",
  url: "https://i2.hdslb.com/bfs/face/eaa74bee5a7a0bb937b7128f8b31f4fcf1353e3b.jpg@160w_160h_1c_1s.webp"
};
const api = {
  prefix: "/api",
  files: {
    prefix: "/files",
    upload_file: "/upload_file"
  },
  user: {
    prefix: "/user",
    login: "/login",
    register: "/register",
    modify: "/modify",
    create_comment: "/create_comment",
    verify_email: "/verify_email/",
    favorite: "/favorite",
    get_favorite: "/get_favorite",
    get_history: "/get_history",
    search: "/search",
    create_report: "/create_report"
  },
  goods: {
    prefix: "/goods",
    goods_info: "/goods_info",
    add_goods: "/add_goods",
    modify_goods: "/modify_goods",
    goods_display: "/goods_display"
  },
  post: {
    prefix: "/post",
    post_display: "/post_display",
    read_post: "/read_post",
    create_post: "/create_post",
    modify_post: "/modify_post",
    remove_post: "/remove_post"
  },
  favorite: {
    prefix: "/user"
  },
  message: {
    prefix: "/user",
    send: "/send_msg",
    receive: "/receive_msg"
  },
  history: {
    prefix: "/user"
  },
  exchange: {
    prefix: "/user"
  }
};
const cfg = {
  default_avatar,
  server,
  port,
  socketPath,
  files,
  empty_image,
  api
};
exports.cfg = cfg;
