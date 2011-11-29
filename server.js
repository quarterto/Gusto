importPackage(Packages.com.sun.net.httpserver);
importPackage(java.io);

require("extend.js").extend(Object,String,Array,Boolean,JSON);
const router = require("router.js"),
staticroute = require("staticroute.js"),
list = require("list.js");

exports.init = function(config) {
	require.paths.push(config.appDir);
	const routes = require(appDir+"/conf/routes.js").routes.call(staticroute,list.controllers()),
	      addr = new java.net.InetSocketAddress(config[config.appMode].address || "localhost", config[config.appMode].port || 8000),
	      server = HttpServer.create(addr, config[config.appMode].backlog || 10);

	server.createContext("/", router);
	server.start();
	print("Listening on "+addr);
}