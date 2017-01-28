var baseUrl = 'http://ec2-54-87-151-139.compute-1.amazonaws.com/annotations';

var pageUri = function (documentId) {
    return function() {
        return {
          beforeAnnotationCreated: function (ann) {
            ann.uri = documentId;
          }
        };
    };
};

var loadAnnotator = function(documentId) {
  var app = new annotator.App();
  app.include(annotator.ui.main);
  app.include(annotator.storage.http, {
      prefix: baseUrl + '/api',
      headers: { 'x-annotator-auth-token': getToken() }
  });
  app.include(pageUri(documentId));
  app.start().then(function () {
      app.annotations.load({uri: documentId});
  });
}

var getToken = function() {
  // Header
  var oHeader = {alg: 'HS256', typ: 'JWT'};
  // Payload
  var oPayload = {};
  var tNow = KJUR.jws.IntDate.get('now');
  var tEnd = KJUR.jws.IntDate.get('now + 1day');
  oPayload.iss = baseUrl;
  oPayload.sub = 'user';
  oPayload.nbf = tNow;
  oPayload.iat = tNow;
  oPayload.exp = tEnd;
  oPayload.jti = 'id123456';
  oPayload.aud = baseUrl + '/api';
  // Sign JWT
  var sHeader = JSON.stringify(oHeader);
  var sPayload = JSON.stringify(oPayload);
  var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "8077277a-44fa-405b-be9d-df55df4b9dcc");
  return sJWT;
}
