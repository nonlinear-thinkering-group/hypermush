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

const Chat = {
  view: () => {
      return m("main", {
        onupdate: (vnode)=>{
          vnode.dom.scrollTo(0,vnode.dom.scrollHeight);
        }
      }, model.messages.map((message, id)=>{
        var distance = 0;
        if(id>0){
          let prevdate = model.messages[id-1].date
          let datedistance = new Date(message.date) - new Date(prevdate)
          distance = Math.floor(datedistance/1000)
          if(distance > 1000) {
            distance = 1000
          }
        }
        return m(Message, {message: message, distance: distance})
      }))
  }
}

const Message = {
    view: (vnode) => {
        let message = vnode.attrs.message
        let distance = vnode.attrs.distance

        return m(".message", [
            m(".message-user",model.names[message.user]),
            m("div.message-text", {
                style: "color: "+model.colors[message.user]+";"
            },m.trust( md.render(message.text) )),
        ])
    }
}

const Aside = {
  view: () => {
    return m("aside", [
        m(".key", "room: "+model.room),
        m(".peopleinroom",model.peopleinroom.map((person)=>{
            return m(".person", model.names[person])
        }))
    ])
  }
}

const Input = {
  view: () => {
    return m("input", {
      value: model.input,
      oninput: (e)=>{
        model.input = e.target.value
      },
      onkeypress: (e)=>{
        if(e.key === "Enter" && model.input !== ""){
          controller.message(model.input, model.dungeon_key)
          model.input = ""
          m.redraw()
        }
      }
    })

  }
}

const Hello = {
  view: () => {
    return m(".wrap", [
      m(".central", [
        m(Chat),
        m(Aside)
      ]),
      m(".bottom", [
        m(".key", "your key: "+model.my_key),
        m(Input)
      ])
    ])

  }
}

m.mount(document.body, Hello)

const ev = require("./events")
ev.emit("load")
