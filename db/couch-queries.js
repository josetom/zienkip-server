'use strict';

var query = {};

module.exports = query;

query.login = "select meta(p).id as uuid, p.* from user_store us join profiles p on keys (us.uuid) where meta(us).id = $1 and us.pwd = $2";

query.cookieLogin = "select meta(p).id as uuid, p.* from profiles p where meta(p).id = $1";