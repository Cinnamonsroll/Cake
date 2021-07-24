module.exports = class cakeArray extends Array {
  random() {
    return this[~~(Math.random() * this.length)];
  }
  len(callback){
    return this.filter(callback).length
  }
};
