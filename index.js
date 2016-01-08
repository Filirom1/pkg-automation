var fs = require('fs')
var path = require('path')
var child_process = require('child_process')
var fetchVersion = require('fetch-versions');
var yaml = require("js-yaml")
var async = require('async')
var _ = require("underscore")

var config = yaml.safeLoad(fs.readFileSync('config.yml'))
async.map(config.items, function(item, cb){
  fetchVersion(item.type, item.params, cb)
}, function(err, data){
  if(err){
    return console.error(err);
  }
  
  async.forEachOf(data, function(version, i, cb){
    version = version[0];
    var id = config.items[i].id;
    var callback = config.items[i].callback;
    if(!callback) return cb()
    var callback_path = path.resolve(__dirname, 'callbacks', callback)
    var child = child_process.execFile(callback_path, [id, version], cb);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  }, function(err){
    if(err){
      return console.error(err);
    }
  });
});
