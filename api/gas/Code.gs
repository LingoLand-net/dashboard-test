// Router for Apps Script Web App
// Expects query params: ?resource=students&action=list (or use POST with JSON body)

function doGet(e){
  return handleRequest(e);
}

function doPost(e){
  return handleRequest(e);
}

function doOptions(e){
  // Handle CORS preflight requests
  var output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);
  output.addHeader('Access-Control-Allow-Origin', '*');
  output.addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  return output;
}

function handleRequest(e){
  try{
    var params = e.parameter || {};
    var resource = params.resource || '';
    var action = params.action || 'list';
    var body = {};
    if (e.postData && e.postData.contents){
      try{ body = JSON.parse(e.postData.contents); } catch(err){ body = {}; }
    }
    // basic auth check (resource-level modules can call requireAuth themselves)
    // route using convention: resource_action -> e.g. students_list
    var fnName = resource + '_' + action;
    if (typeof this[fnName] === 'function'){
      var result = this[fnName](params, body, e);
      return jsonResponse(result);
    }
    return jsonResponse({ ok:false, error: 'Unknown resource/action: ' + resource + '/' + action }, 404);
  }catch(err){
    return jsonResponse({ ok:false, error: err.message, stack: err.stack }, 500);
  }
}

function jsonResponse(obj, status){
  var payload = JSON.stringify(obj || {});
  // ContentService.createTextOutput returns a TextOutput object
  // TextOutput doesn't support setHeader - just set the MIME type and return
  return ContentService.createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}
