// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: vector-square;

/*!
 * Qiita.js
 *
 * Copyright (c) ©︎ 2021 Kynako
 *
 * This software is released under the MIT license.
 * See https://github.com/Kynako/QiitaWidget/blob/main/LICENSE
*/

// pretty json
console.pjson = (value) => {
  console.log(JSON.stringify(value, null, 2))
};

// dir
const DIR = 'QiitaWidget'
// config
const CONFIG = {
  userid: args.widgetParameter || 'Qiita',
};

const fm = FileManager.iCloud()

// token
const root = fm.joinPath(
  fm.documentsDirectory(), DIR + '/'
)
const TOKEN = await fm.readString(root+'token.txt');

// modules
const Qiita = importModule(`${DIR}/modules/Qiita`)
const qiita = new Qiita({AT: TOKEN})
const Cache = importModule(`${DIR}/modules/cache`)
const getWidgetSizeInPoint = importModule(`${DIR}/modules/getWidgetSizeInPoint`)

// cache
const cacheName = `${DIR}/cache/@${CONFIG.userid}`
const expirationMinutes = 60 * 3// 3 hours
let USER = await getUserData(
  cacheName, expirationMinutes
)
console.pjson(USER)
let SCRAPED_USER = await getScrapedUserData(
  cacheName, expirationMinutes
)
console.pjson(SCRAPED_USER)

// temporaty_username, userid
USER._temporary_username = USER.name != ''
  ? USER.name : `@${USER.id}`;
USER._temporary_userid = USER.name != ''
  ? `@${USER.id}` : '';

// wsize
const WSIZE = getWidgetSizeInPoint(
  config.widgetFamily || 'medium'
);

// colors
const isUDA = Device.isUsingDarkAppearance()
const COLOR = {
  black: new Color('1d2121'),
  white: new Color('ffffff'),
  header: new Color('56c100'),
  gray: new Color('777777'),
};

// APPEARANCE
const DARKCOLOR = {
  header: COLOR.header,
  bg: COLOR.black,
  text: COLOR.white,
  gray: COLOR.gray
}
const LIGHTCOLOR = {
  header: COLOR.header,
  bg: COLOR.white,
  text: COLOR.black,
  gray: COLOR.gray
};
const APPEARANCE = isUDA ? DARKCOLOR : LIGHTCOLOR;
console.pjson(APPEARANCE)

// qiita_png
const QIITA_PNG = (()=>{
  const qiita_png = {}
  const fm = FileManager.iCloud()
  let dirPath = fm.bookmarkedPath('qiita-png')
  let list = fm.listContents(dirPath)
  for(let fileName of list){
    let filePath = fm.joinPath(dirPath, fileName)
    qiita_png[fm.fileName(filePath, false)] = fm.readImage(filePath)
  }
  return qiita_png
})()

// ===================================================

let widget = null
if (config.runsInWidget) {
  if (config.widgetFamily == "medium") {
    console.log(WSIZE)
    widget = await createWidget(USER)
  }
  Script.setWidget(widget)
  Script.complete()
} else if (config.runsWithSiri) {
    widget = await createWidget(USER);
    await widget.presentMedium();
    Script.complete()
} else {
  presentMenu(widget)
};

async function presentMenu(widget) {
  let alert = new Alert()
  alert.title = 'QiitaWidget';
  alert.addAction('Show USER Data');
  alert.addAction('Show SCRAPED_USER data')
  alert.addAction('View Widget');
  alert.addCancelAction("Cancel");
  let idx = await alert.presentSheet();
  switch(idx) {
    case 0: QuickLook.present(USER); break;
    case 1: QuickLook.present(SCRAPED_USER); break;
    case 2: {
      let widget = await createWidget(USER);
      await widget.presentMedium()
      break;
    };
  };
};

// ==================================================
async function createWidget(user){
  let w = new ListWidget()
  w.backgroundColor = APPEARANCE.bg
  w.refreshAfterDate = null
  // entire
  let entireSt = w.addStack()
  entireSt.layoutVertically()
  
  // entire - head
  let headSt = entireSt.addStack()
  let headStPad = [2, 15, 2, 15]
  headSt.layoutHorizontally()
  headSt.size = new Size(WSIZE.width, 30)
  headSt.backgroundColor = APPEARANCE.header
  headSt.setPadding(...headStPad)
  
  // entire - head - logo(image)
  let logo = headSt.addImage(
    isUDA ? QIITA_PNG['logo'] : QIITA_PNG['logo-background-color']
  )
  logo.imageSize = new Size(66, 25)
  headSt.addSpacer(WSIZE.width-headStPad[1]-headStPad[3]-logo.imageSize.width-25)
  
  // entire - body - usericon(image)
  let usericon = headSt.addImage(
    await getIcon(user.profile_image_url)
  )
  usericon.size = new Size(25, 25)
  usericon.rightAlignImage()
  usericon.url = `https://qiita.com/${user.id}`
  
  // entire - body
  let bodySt = entireSt.addStack()
  let bodyStPad = [10, 15, 15, 15]
  bodySt.layoutVertically()
  bodySt.setPadding(...bodyStPad)
  bodySt.size = new Size(WSIZE.width, WSIZE.height-headSt.size.height)
  bodySt.backgroundColor = APPEARANCE.bg
  
  // entire - body - usernameidSt
  let usernameidSt = bodySt.addStack()
  usernameidSt.layoutVertically()
  
  // entire - body - usernameid - username(text)
  let username = usernameidSt.addText(user._temporary_username)
  username.size = new Size(WSIZE.width-bodyStPad[1]-bodyStPad[3], 30)
  username.font = Font.mediumSystemFont(30)
  username.textColor = APPEARANCE.text
  username.lineLimit = 1
  
  // entire - body - usernameid - userid(text)
  let userid = usernameidSt.addText(user._temporary_userid)
  userid.size = new Size(WSIZE.width-bodyStPad[1]-bodyStPad[3], 15)
  userid.font = Font.regularSystemFont(15)
  userid.textColor = APPEARANCE.gray
  userid.lineLimit = 1
  
  usernameidSt.addSpacer(10)
  
  // entire - body - usercountSt
  let usercountSt = bodySt.addStack()
  usercountSt.layoutHorizontally()
  
  // entire - body - usecountSt - item, contribution, follower
  const countdata = {
    item: user.items_count,
    followers: user.followers_count,
    contribution: SCRAPED_USER.contribution
  }
  for(let key in countdata){
    // entire - body - usercount - item(loop)
    let itemSt = usercountSt.addStack()
    itemSt.layoutVertically()
    itemSt.size = new Size(
      (WSIZE.width-bodyStPad[1]-bodyStPad[3])/Object.keys(countdata).length,
      bodySt.size.height-usernameidSt.size.height-80
    )
    
    
    // entire - body. usercount - item - count
    let count = itemSt.addText(
      countdata[key].toString()
    )
    count.font = Font.regularSystemFont(25)
    count.textColor = APPEARANCE.text
    count.centerAlignText()
    
    // entire - body - usercount - item - name(text)
    let name = itemSt.addText(key.toString())
    name.font = Font.regularSystemFont(15)
    name.textColor = APPEARANCE.gray
    name.centerAlignText()
    
  };
  return w
}

async function getIcon(url){
  let r = new Request(url)
  let icon = await r.loadImage()
  let width = icon.size.width
  let dc = new DrawContext()
  dc.size = icon.size
  dc.opaque = false
  // draw icon
  dc.drawImageAtPoint(icon, new Point(0, 0))
  // draw mask
  dc.setStrokeColor(COLOR.header)
  let outline_width = Math.sqrt(2)*(width-1)/2
  dc.setLineWidth(outline_width)
  dc.strokeEllipse(
    new Rect(
      0-outline_width/2, 0-outline_width/2, width+outline_width, width+outline_width
  ))
  return dc.getImage()
};

async function getUserData(name, expirationMinutes){
  let cache = new Cache(name)
  let cacheKey = `api`
  let cachedUserData = await cache.read(
    cacheKey, expirationMinutes
  )
  if(cachedUserData == null || CONFIG.userid != cachedUserData.id){
    // hasn't existed yet
    console.log('Loading user data...')
    let user = await qiita.get(
      `/api/v2/users/${CONFIG.userid}`
    )
    cache.write(cacheKey, user)
    return user
  } else {
    // has existed
    console.log('Using user cache...')
    return cachedUserData
  };
}

async function getContribution(userid){
  // request html
  const url = `https://qiita.com/${userid}`
  const r = new Request(url)
  const html = await r.loadString()

  // script tag
  const scriptTags = html.match(/<script.*<\/script>/g)
  const data = scriptTags[scriptTags.length-1]
    .replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
    .replace(/\\\\/g, '')
  const obj = JSON.parse(data)
  return obj.user.user
}

async function getScrapedUserData(name, expirationMinutes){
  let cache = new Cache(name)
  let cacheKey = 'scraping'
  let cachedScrapedUserData = await cache.read(
    cacheKey, expirationMinutes
  )
  if(cachedScrapedUserData == null || CONFIG.userid != cachedScrapedUserData.urlName){
    // hasn't existed yet
    console.log('Loading scraped_user data...')
    let scraped_user = await getContribution(CONFIG.userid)
    cache.write(cacheKey, scraped_user)
    return scraped_user
  } else {
    // has existed
    console.log('Using scraped_user cache...')
    return cachedScrapedUserData
  };
};
