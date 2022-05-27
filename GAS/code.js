function SendTweet() {
    let spreadsheet = SpreadsheetApp.openById('スプレッドシートのID');//スプレッドシートのID
    let sheet = spreadsheet.getSheetByName('Twitter');//シートのID
    var twitterService = getTwitterService("ツイートするアカウントの名前");//ツイートするアカウントの名前(＠マークからはじまるアレ)
      let block_text = sheet.getRange(`D3`).getValue();
  let texts = sheet.getRange(`A:A`).getValues().filter(text => text != "" && text != block_text);
  console.log(texts)
  let random_text = texts[Math.floor(Math.random() * texts.length)];
  sheet.getRange(`D3`).setValue(random_text)
  var message = {
    text: `${random_text}`
  }
    var options = {
      "method": "post",
      "muteHttpExceptions": true,
      'contentType': 'application/json',
      'payload': JSON.stringify(message)
    }
    var response = JSON.parse(twitterService.fetch('https://api.twitter.com/2/tweets', options));
    Logger.log(response);
  }
  
  function getTwitterService(serviceName) {
    return OAuth1.createService(serviceName)
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      .setConsumerKey("ConsumerKey")//ConsumerKeyをここに入力
      .setConsumerSecret("ConsumerSecret")//ConsumerSecretをここに入力
      .setCallbackFunction('authCallback')
      .setPropertyStore(PropertiesService.getUserProperties());
  }
  
  function authCallback(request) {
    var twitterService = getTwitterService(request.parameter.serviceName);
    var isAuthorized = twitterService.handleCallback(request);
    if (isAuthorized) {
      return HtmlService.createHtmlOutput('認証が正常に終了しました');
    } else {
      return HtmlService.createHtmlOutput('認証がキャンセルされました');
    }
  }
  
  function doGet(e) {
    var twitterService = getTwitterService(e.parameter.screenName);
    var template;
    if (!twitterService.hasAccess()) {
      var authorizationUrl = twitterService.authorize();
      template = HtmlService.createTemplateFromFile("index");
      template.authorizationUrl = authorizationUrl;
    } else {
      template = HtmlService.createTemplateFromFile("completed");
    }
    return template.evaluate();
  }
