var categories = App.api("blog_categories", {})
var route_names = [
  { html: "landing.html", title: "Home - 卫理华人年议会 Methodist Chinese Annual Conference", route: "/home" },
  { html: "account.html", title: "Account - 卫理华人年议会 Methodist Chinese Annual Conference", route: "/account" },
  { html: "event_listing.html", title: "Events - 卫理华人年议会 Methodist Chinese Annual Conference", route: "/event_listing/:id/:title" },
  { html: "event_show.html", title: "Event - 卫理华人年议会 Methodist Chinese Annual Conference", route: "/events/:id/:title" },

  { html: "blog_listing.html", title: "Blogs - 卫理华人年议会 Methodist Chinese Annual Conference", route: "/blog_listing/:id/:title" },
  { html: "blog_show.html", title: "Blog - 卫理华人年议会 Methodist Chinese Annual Conference", route: "/blogs/:id/:title" },
  { html: "page_show.html", title: "Page - 卫理华人年议会 Methodist Chinese Annual Conference", route: "/pages/:id/:title", customNav: "blog_nav_sub.html" },

]

function navigateTo(route, additionalParamString, dom) {
  console.log(dom)
  // event.preventDefault();
  App.show()

  if (route == null) {
    route = window.location.pathname
  }
  var current_pattern = route.split("/").filter((v, i) => {
    return v != "";
  })
  console.log(current_pattern)

  var match_1 = route_names.filter((rroute, i) => {
    var z = rroute.route.split("/").filter((v, i) => {
      return v != "";
    })
    console.log(z[z.length - 1])

    if (z[z.length - 1].includes(":")) {
      return z.length == current_pattern.length
    } else {

      return z.length == current_pattern.length && z[z.length - 1] == current_pattern[z.length - 1];
    }
  })

  var match_2 =
    match_1.filter((rroute, i) => {
      console.log(rroute)
      var z = rroute.route.split("/").filter((v, i) => {
        return v != "";
      })
      return z[0] == current_pattern[0]
    })

  if (match_2.length > 0) {

    var params = {}
    match_2.forEach((rroute, i) => {
      var z = rroute.route.split("/").forEach((v, ii) => {
        if (v.includes(":")) {
          params[v.replace(":", "")] = current_pattern[ii - 1]
        }
      })
    })
    console.log("params here")
    console.log(params)
    window.pageParams = params
    var xParamString = ""
    if (additionalParamString == null) {
      xParamString = ""
    } else {
      xParamString = additionalParamString
    }

    if (window.back) {
      window.back = false
    } else {
      var stateObj = { fn: `navigateTo('` + route + `', '` + xParamString + `')`, params: params };
      console.log("route")
      console.log(route)
      window.stateObj = stateObj
      window.matchTitle = match_2[0].title
      window.matchRoute = route


      if (Object.keys(params).includes("title")) {
        $("title").html(params.title)
        history.pushState(stateObj, params.title, route);
      } else {
        $("title").html(match_2[0].title)
        history.pushState(stateObj, match_2[0].title, route);
      }
    }
    var html = App.html(match_2[0].html)
    var keys = Object.keys(match_2[0])
    $("html")[0].scrollIntoView()


    if (keys.includes("skipNav")) {
      $("#subcontent").html(html)

    } else {
      var nav = App.html("blog_nav.html")

      if (keys.includes("customNav")) {
        var nav = App.html(match_2[0].customNav)
      }

      $("#subcontent").html(nav)
      $("#subcontent").append(html)

      App.hide()

    }

    checkLoginUser();
    return match_2[0]
  } else {
    var html = App.html("landing.html")
    var nav = App.html("blog_nav.html")
    $("#subcontent").html(nav)
    $("#subcontent").append(html)

    checkLoginUser();

    App.hide()

  }


}

function updatePageParams(obj) {
  window.stateObj = obj
  history.pushState(obj, obj.title, obj.route);
}

function logout() {
  localStorage.removeItem("pkey")
  // $("#ulg").html("Login")
  navigateTo("/home")
  // $("#xr").removeClass("d-none")
  // $("#axr").addClass("d-none")
  // $("#aax").removeClass("d-none")
  // $(".online-status").removeClass("bg-success")
  window.userToken = null
  App.notify("Logout")
}

function checkLoginUser() {
  if (localStorage.getItem("pkey") != null) {
    window.userToken = localStorage.getItem("pkey")

    var pdata = App.api("get_member_profile", { token: window.userToken }, () => {
      window.member = null
      localStorage.removeItem("pkey")
      // $("#ulg").html("Login")
      // $("#xr").removeClass("d-none")
      // $("#axr").addClass("d-none")
      // $("#aax").removeClass("d-none")
      // $(".online-status").removeClass("bg-success")
      window.userToken = null
      App.notify("Logout")
    })
    window.pdata = pdata
    window.member = pdata
    // $("#xr").addClass("d-none")
    // $("#axr").removeClass("d-none")
    $("span[aria-label='displayName']").html("Hi, " + pdata.name)
    // $("#ulg").html("Hi, " + pdata.name)
    // $("#ulg2").html(pdata.name)
    // $("#aax").addClass("d-none")
    // $(".online-status").addClass("bg-success")
    // genCode();
  }
}
var ui;
$(document).ready(() => {

  var firebaseConfig = {
    apiKey: "AIzaSyCJJTXUbUlyai7QWuw51aE6FHr7xrcQrUM",
    authDomain: "cac-my.firebaseapp.com",
    projectId: "cac-my",
    storageBucket: "cac-my.appspot.com",
    messagingSenderId: "878950911140",
    appId: "1:878950911140:web:f784759123b3cc25db2a31",
  };

  if (!firebase.apps.length) {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.auth().languageCode = "en";
  } else {
    firebase.app(); // if already initialized, use that one
  }
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "sign-in-button", {
      size: "invisible",
      callback: function(response) {
        console.log(response);
      }
    }
  );
  ui = new firebaseui.auth.AuthUI(firebase.auth());
  navigateTo();

})


function populate_menus() {
  parents = categories.filter((cat, i) => {
    return cat.parent.name == cat.name
  })
  console.log(parents)

  $("ul[aria-label='web-nav']").html('')
  parents.forEach((cat, i) => {
    var pages = []

    cat.children.forEach((child, ii) => {
      var cname = child.name
      if (child.alias != null) {
        cname = child.alias
      }
      var a = `<a class="dropdown-item navi" href="/blog_listing/` + child.id + `/` + child.name + `"
      
       >` + cname + `</a>`
      pages.push(a)
    })

    var div = `<div class="dropdown-menu ">` + pages.join("") + `
                </div>`
    var name = cat.name

    if (cat.alias != null) {
      name = cat.alias
    }

    var li = `
        <li class="nav-item dropdown">
          <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">` + name + ` <span class="caret"></span></a>
          ` + div + `
        </li>`
    if (cat.show_menu) {
      $("#nav_items").append(li)
      $("#nav_items2").append(li)
      var li2 = `
      <li>
        <a class="navi" href="/blog_listing/` + cat.id + `/` + cat.name + `">
          <i class=""></i>` + name + `</a></li>`
      $("ul[aria-label='web-nav']").append(li2)
    }


  })
  populate_directory()
  populate_footer()




}

function checkLogin(){
  if (localStorage.pkey != null) {
    navigateTo("/account")
  } else {
    memberLogin()
  }

}

function populate_directory() {
  var directories = App.api("get_directory", {})

  $("ul.quick-links").html('')

  directories.forEach((v, i) => {
    var li = ` <li class="navi nav-item">
      <a class="nav-link" href="/pages/` + v.id + `/` + v.title + `" >` + v.title + `</a>
    </li>`

    $("ul.quick-links").append(li)
    var li = ` <li class="navi nav-item">
      <a class="nav-link" href="/pages/` + v.id + `/` + v.title + `" >` + v.title + `</a>
    </li>`

    $("#nav_items").append(li)

  })

  var li = ` 

    <li class=" nav-item">
      <a id="axr" onclick="checkLogin()" style="cursor: pointer;" class="  nav-link p-2"> 
      <i class="fa fa-user pe-2"></i>
      <span aria-label='displayName'>Profile</span> </a>
    </li>
    `
  $("#nav_items").append(li)
  $(".quick-links").append(li)

}

function populate_footer() {
  var groups = App.api("list_groups", {})
  $("ul[aria-label='cac-directory']").html('')
  groups.forEach((g, i) => {
    var li = `<li>
      <a href="javascript:void(0);">
        <i class=""></i>` + g.name + `</a>
        </li>`
    $("ul[aria-label='cac-directory']").append(li)
  })
  var dt = new Date()
  var edate = dt.toGMTString().split(",")[1].split(" ").splice(0, 4).join(" ")
  $("#tedate").html(edate)
}