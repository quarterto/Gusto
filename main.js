require("sugar.js");
Object.sugar();
exports.mode = "testing";
exports.setMode = function(m) {
	exports.mode = m;
}
const fs = require("fs"),
appDir = process.cwd(),
base = JSON.parse(fs.readFileSync(appDir+"/conf/app.conf","utf8")),
config = exports.config = base.merge({appDir: appDir}),
server = require("server.js"),
actions = {
	"run": function() {
		server.go();
	}.merge({desc:"Run the app in testing mode"}),
	"help": function(){
		console.log("Struct framework\n");
		this.each(function(k,v){
			console.log(k.padRight(" ",8-k.length),v.desc);
		});
	}.merge({desc:"Show this help"})
};
if(process.argv[2] in actions)
	actions[process.argv[2]].apply(actions,process.argv.slice(2));
else
	actions.help();
