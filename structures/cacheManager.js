module.exports = class cakeCache {
  constructor() {}
  resolveType(type) {
    let types = {
      array: [],
      object: {},
      dict: {},
      list: [],
      str: "",
      string: "",
    };
    return type === "custom"
      ? type
      : Object.keys(types).includes(type)
      ? types[type]
      : undefined;
  }
  parseOptions(ops) {
    return {
      sub: ops.sub,
      type: ops.type ?? {},
      value: ops.value,
    };
  }
  add(name, ops = {}) {
    let options = this.parseOptions(ops);
    if (!this[name]) this[name] = this.resolveType(options.type);
    if (options.sub) {
      if (!this[name][options.sub.name])
        this[name][options.sub.name] = this.resolveType(options.sub.type);
      if (options.sub.value) {
        let cache = this[name][options.sub.name];
        this[name][options.sub.name] = cache.slice(0, ops.max || 999);
        this[name][options.sub.name][ops.front ? "unshift" : "push"](
          options.sub.value
        );
      }
    }
    if (options.value) this[name].push(value);
    return this;
  }
  set(name, ops = {}) {
    let options = this.parseOptions(ops);
    if (!this[name]) this[name] = this.resolveType(options.type);
    if (options.sub && "name" in options.sub) {
      if (!this[name][options.sub.name])
        this[name][options.sub.name] = this.resolveType(options.sub.type);
      if (options.sub.value) this[name][options.sub.name] = options.sub.value;
    }
    if (options.value) this[name] = value;
    return this;
  }
};
