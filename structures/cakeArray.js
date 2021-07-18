module.exports = class cakeArray extends Array {
  random() {
    return this[~~(Math.random() * this.length)];
  }
};
