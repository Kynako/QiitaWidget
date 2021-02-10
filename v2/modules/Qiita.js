// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: book-open;
/*!
 * Qiita.js
 *
 * Copyright (c) ©︎ 2021 Kynako
 *
 * This software is released under the MIT license.
 * See https://github.com/Kynako/QiitaWidget/blob/main/LICENSE
*/
class Qiita {
  constructor(env){
    this.AT = env.AT,
    this.qiita_base = 'https://qiita.com'
  };
  
  get(endpoint, param){
    let url = this.qiita_base + endpoint + this._buildQueryString(param);
console.log(url)
    let r = new Request(url);
    r.method = 'GET';
    r.headers = {...this._getAuthHeader()};
    return r.loadJSON()

  };
  
  post(endpoint, param={}){
    let url = this.qiita_base + endpoint;
    let r = new Request(url);
    r.method = 'POST';
    r.headers = {...this._getAuthHeader()};
    r.body = param;
    return r.loadJSON();
  };
  
  patch(endpoint, param={}){
    let url = this.qiita_base + endpoint;
    let r = new Request(url);
    r.method = 'PATCH';
    r.headers = {...this._getAuthHeader()};
    r.body = param;
    return r.loadJSON();
  };
  
  put(endpoint, param={}){
    let url = this.qiita_base + endpoint;
    let r = new Request(url);
    r.method = 'PUT';
    r.headers = {...this._getAuthHeader()};
    r.body = param;
    return r.loadJSON();
  };
  
  delete(endpoint, param={}){
    let url = this.qiita_base + endpoint;
    let r = new Request(url);
    r.method = 'delete';
    r.headers = {...this._getAuthHeader()};
    r.body = param;
    return r.loadJSON();
  };
  
  _buildQueryString(param){
    if(param != undefined){
      return'?' + Object.keys(param).sort().map((k)=>{
        return `${k}=${encodeURIComponent(param[k])}`;
      }).join('&')
    } else return ''
  };

  _getAuthHeader(){
     return {'Authorization': 'Bearer ' + this.AT};
  };
  
}
module.exports = Qiita;