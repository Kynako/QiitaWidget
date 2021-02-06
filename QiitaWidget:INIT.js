// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: cloud-download-alt;
/* QiitaWidget:INIT.js
 * iCloud/Scriptable/
   ├ QiitaWidget.js
   └ QiitaWidget/
     ├ token.txt
     ├ modules/
     │ ├ Qiita.js
     │ └ Cache.js
     └ caches/
       └ :userid/
         ├ api
         └ scraped
*/
// ==================================================

class Ginit {
  constructor(){
    this.fm = FileManager.iCloud();
    this.base = 'https://raw.githubusercontent.com/'
  };
  
  async set(list, parent, hierarky=0){
//     console.log(`hierarky: ${hierarky}`)
    let tab = '  '.repeat(hierarky)
    for(let data of list){
      if(typeof data === 'object'){
        console.warn(`${tab}${data.dir}`)
        let familly = parent + data.dir;
        if(!this.fm.fileExists(familly)){
          fm.createDirectory(familly, false);
        };
        await this.set(
          data.list,
          parent + data.dir,
          hierarky + 1
        );
      } else if(typeof data === 'string'){
        console.warn(`${tab}${data}`)
        let fileName = this.fm.fileName(data, true);
        let filePath = parent + fileName;
        if(!this.fm.fileExists(filePath)){
          console.log(`${tab}NOT EXISTS`);
          await this._load(data, parent, tab);
        };
        console.log(`${tab}${filePath}`)
        console.log(`${tab}EXISTS`);
      } else {
        console.error('Error');
      };
    }
  };
  
  async _load(data, parent, tab){
    try {
      let url = this.base + data;
      console.log(`${tab}url: ${url}`)
      let r = new Request(url);
      let res = await r.load();
      if(r.response.statusCode >= 400){
        throw this._pj(r.response);
      }
      let fileName = this.fm.fileName(data, true);
      console.log(`${tab}${parent+fileName}`);
      this.fm.write(parent+fileName, res)
    } catch (e) {
      console.error(e)
    }
      
  };
  
  _pj(value){
    return JSON.stringify(value, null, 2);
  }
};
// =================================================

const repo = 'Kynako/QiitaWidget/main';
const list = [
  `${repo}/dir/QiitaWidget.js`,
  {
    dir: 'QiitaWidget/',
    list: [  
      {  
        dir: 'quita_png/',  
        list: [
          `${repo}/dir/qiita_png/logo.png`,
          `${repo}/dir/qiita_png/logo-background-color.png`
        ]
      },
      {
        dir: 'modules/',
        list: [
          `${repo}/dir/modules/cache.js`,
          `${repo}/dir/modules/getWidgetSizeInPoint.js`,
          `${repo}/dir/modules/Qiita.js`
        ]
      }
    ]
  }
]
// ==================================================
const fm = FileManager.iCloud();
const dirPath = fm.joinPath(
  fm.documentsDirectory(), 'QiitaWidget/'
)
if(!fm.fileExists(dirPath)){
  fm.createDirectory(dirPath, false);
}

const ginit = new Ginit();
await ginit.set(list, fm.documentsDirectory()+'/');

const token = await getToken()
fm.writeString(dirPath + 'token.txt', token)
console.log(`token: ${token}`);

async function getToken(){
  let alert = new Alert();
  let paste = Pasteboard.pasteString();
  alert.title = 'Input your token.';
  alert.addTextField('Access Token', paste);
  alert.addCancelAction('Cancel');
  alert.addAction('Ok');
  let idx = await alert.presentAlert();
  switch(idx){
    case -1: Script.complete(); break;
    case 0: return alert.textFieldValue(0); break;
  };
}