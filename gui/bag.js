const fs = require('fs')
const ev = require('./events')
const database = require('./database')
const datn = require('dat-node')

function getItems () {
  fs.readdir('./files/bag/', (err, files) => {
    files = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item))
    ev.emit("bag/load", files)
  })
}
ev.on("load", getItems)

function drop (filename) {
  //TODO: fix this shitty code for the love of god
  const dungeonDat = require("../files/dat.json")
  let my_key = dungeonDat.url.substring(6)

  fs.readdir('./files/bag/', (err, files) => {
    if (files.find( f => f===filename )){
      fs.rename('./files/bag/' + filename, './files/drop/' + filename, (err) => {
        if (err) throw err
        ev.emit("bag/dropped", filename)
        getItems()
      })
      return false
    }
  })
}
ev.on("controller/drop", drop)


function pick (filename) {
    let found = model.dropped.find(item => item.file === filename)
    if(found){
        console.log(found)
        datn('./map/' + found.key, { key: found.key, exit: true }, function (err, dat) {
            if (err) throw err
            console.log(dat)

            dat.archive.on('sync', function () {

                var rd = fs.createReadStream('./map/' + found.key + '/drop/' + filename);
                  rd.on("error", function(err) {
                    done(err);
                  });
                  var wr = fs.createWriteStream('./files/bag/' + filename);
                  wr.on("error", function(err) {
                    done(err);
                  });
                  wr.on("close", function(ex) {
                    done();
                  });
                  rd.pipe(wr);

                  function done(err) {
                      if (err) throw err
                      console.log("sync")
                      ev.emit("bag/picked", filename)
                      getItems ()
                  }
            })

            dat.joinNetwork()
            //TODO: when all files were copied, copy file to bag
            //var progress = dat.importFiles({watch: true}) // with watch: true, there is no callback
            //progress.on('exit', function (src, dest) {
            //    console.log('Done, syncing')
            //})
            //if (state.opts.exit && download.modified) {
            //      return `dat sync complete.\nVersion ${stats.version}`
            //}

        })
    } else {
        ev.emit("bag/notfound", filename)
    }
}
ev.on("controller/pick", pick)

module.exports = {
  drop: drop,
  pick: pick,
}
