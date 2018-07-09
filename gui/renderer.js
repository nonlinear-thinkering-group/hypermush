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
            //m("span.message-date", moment(message.date).format('DD-MM-YY HH:mm')),
            //m("span.message-user", {
            //    class: (model.online.indexOf(message.user)>-1)?"online":"offline"
            //},"@"+ model.names[message.user]),
            m("div.message-text", {
                style: "color: "+model.colors[message.user]+";" +
                       "margin-top: "+ distance + "px;"
            },m.trust( md.render(message.text) )),
        ])
    }
}

const Hello = {
    view: () => {
        return m("main", [
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
        ])
    }
}

//setTimeout(()=>{
m.mount(document.body, Hello)
//},1000)
