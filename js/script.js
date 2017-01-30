var annotationsBase = 'http://localhost:5000';

var pageUri = function (documentId) {
    return function() {
        return {
          beforeAnnotationCreated: function (ann) {
            ann.uri = documentId;
          }
        };
    };
};

var getToken = function() {
  // Header
  var oHeader = {alg: 'HS256', typ: 'JWT'};
  // Payload
  var oPayload = {};
  var tNow = KJUR.jws.IntDate.get('now');
  var tEnd = KJUR.jws.IntDate.get('now + 1day');
  oPayload.iss = annotationsBase;
  oPayload.sub = 'user';
  oPayload.nbf = tNow;
  oPayload.iat = tNow;
  oPayload.exp = tEnd;
  oPayload.jti = 'id123456';
  oPayload.aud = annotationsBase + '/api';
  // Sign JWT
  var sHeader = JSON.stringify(oHeader);
  var sPayload = JSON.stringify(oPayload);
  var sJWT = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, "8077277a-44fa-405b-be9d-df55df4b9dcc");
  return sJWT;
}
