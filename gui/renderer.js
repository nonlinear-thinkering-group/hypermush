var md = require('markdown-it')({
  typographer: true,
  linkify: true
});

var mila = require('markdown-it-link-attributes')

md.use(mila, {
  attrs: {
    target: '_blank',
    rel: 'noopener'
  }
})

const Message = {
    view: (vnode) => {
        let message = vnode.attrs.message
        let distance = vnode.attrs.distance

        return m(".message", [
            m("div.message-text", {
                style: "color: "+model.colors[message.user]+";" +
                       "margin-top: "+ distance + "px;"
            },m.trust( md.render(message.text) )),
        ])
    }
}

const Bag = {
  view: () => {
    return m("aside", [
      m(".bag", model.trades.map((trade)=> {
        return m("img", {
          src: 'data:image/jpeg;base64,' + trade
        })
      }))
    ])
  }
}

const Map = {
    view: () => {
        return m(".map", model.map.map((x, i) => {
            return m(".map-row", x.map((y, j) => {
                return m(".map-box", {
                    class: "dungeon"+ (y?1:0) + " " + ((model.position[0]+10===i && model.position[1]+10===j)?"here": "")
                }," ")
            }))
        }))
    }
}

const Hello = {
    view: () => {
      return m(".wrap", [
        m("main", [
            m(".key", "your key: "+model.my_key),
            m(".messages", {
                onupdate: (vnode)=>{
                    vnode.dom.scrollTo(0,vnode.dom.scrollHeight);
                }
            }, model.messages.map((message, id)=>{
                var distance = 0;
                if(id>0){
                    let prevdate = model.messages[id-1].date
                    let datedistance = new Date(message.date) - new Date(prevdate)
                    console.log(message.date, datedistance)
                    distance = Math.floor(datedistance/1000)
                    if(distance > 1000) {
                        distance = 1000
                    }
                }
                return m(Message, {message: message, distance: distance})
            })),
            m("input", {
                value: model.input,
                oninput: (e)=>{
                    model.input = e.target.value
                },
                onkeypress: (e)=>{
                    if(e.key === "Enter" && model.input !== ""){
                        controller.message(model.input)
                        model.input = ""
                        m.redraw()
                    }
                }
            }),
        ]),
        m(Bag),
        m(Map)
      ])

    }
}

//setTimeout(()=>{
m.mount(document.body, Hello)
//},1000)
