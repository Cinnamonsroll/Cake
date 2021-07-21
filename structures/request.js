let fetch = require("node-fetch");
module.exports = class Request {
  constructor() {
    this.headers = {
      Authorization: `Bot ${require("../config.json").token}`,
      "User-Agent": `DiscordBot`,
      "Content-Type": "application/json",
    };
  }
  async get(url, options = {}) {
    return await fetch(url, {
      method: "GET",
      headers: options.headers ?? this.headers,
    }).then((res) =>
      res.headers["content-type"] &&
      res.headers["content-type"].includes("application/json")
        ? res[options.text ? "text" : "json"]()
        : res
    );
  }
  async post(url, options = {}) {
    return await fetch(url, {
      method: "POST",
      headers: options.headers ?? this.headers,
      body: JSON.stringify(options.body ?? {}),
    }).then((res) =>
      res.headers["content-type"] &&
      res.headers["content-type"].includes("application/json")
        ? res[options.text ? "text" : "json"]()
        : res
    );
  }
  async delete(url, options = {}) {
    return await fetch(url, {
      method: "DELETE",
      headers: options.headers ?? this.headers,
    }).then((res) =>
      res.headers["content-type"] &&
      res.headers["content-type"].includes("application/json")
        ? res[options.text ? "text" : "json"]()
        : res
    );
  }
  async put(url, options = {}) {
    return await fetch(url, {
      method: "PUT",
      headers: options.headers ?? this.headers,
      body: JSON.stringify(options.body ?? {}),
    }).then((res) =>
      res.headers["content-type"] &&
      res.headers["content-type"].includes("application/json")
        ? res[options.text ? "text" : "json"]()
        : res
    );
  }
  async patch(url, options = {}) {
    return await fetch(url, {
      method: "PATCH",
      headers: options.headers ?? this.headers,
      body: JSON.stringify(options.body ?? {}),
    }).then((res) =>
      res.headers["content-type"] &&
      res.headers["content-type"].includes("application/json")
        ? res[options.text ? "text" : "json"]()
        : res
    );
  }
};
