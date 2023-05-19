var categories = App.api("blog_categories", {})
var route_names = [{
    html: "landing.html",
    title: "Home - 马来西亚基督教 卫理公会华人年议会",
    route: "/home"
  }, {
    html: "account.html",
    title: "Account - 马来西亚基督教 卫理公会华人年议会",
    route: "/account"
  }, {
    html: "event_listing.html",
    title: "Events - 马来西亚基督教 卫理公会华人年议会",
    route: "/event_listing/:id/:title"
  }, {
    html: "event_show.html",
    title: "Event - 马来西亚基督教 卫理公会华人年议会",
    route: "/events/:id/:title"
  }, {
    html: "church.html",
    title: "Church - 马来西亚基督教 卫理公会华人年议会",
    route: "/church/:id"
  }, {
    html: "southern_bell.html",
    title: "南钟报 - 马来西亚基督教 卫理公会华人年议会",
    route: "/%E5%8D%97%E9%92%9F"
  }, {
    html: "southern_bell.html",
    title: "南钟报 - 马来西亚基督教 卫理公会华人年议会",
    route: "/%E5%8D%97%E9%92%9F/:referral"
  },

  {
    html: "blog_listing.html",
    title: "Blogs - 马来西亚基督教 卫理公会华人年议会",
    route: "/blog_listing/:id/:title"
  }, {
    html: "blog_show.html",
    title: "Blog - 马来西亚基督教 卫理公会华人年议会",
    route: "/blogs/:id/:title"
  }, {
    html: "page_show.html",
    title: "Page - 马来西亚基督教 卫理公会华人年议会",
    route: "/pages/:id/:title",
    customNav: "blog_nav_sub.html"
  }, {
    html: "privacy_policy.html",
    title: "Privacy Policy - 马来西亚基督教 卫理公会华人年议会",
    route: "/privacy_policy",
    skipNav: true
  },

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
      var stateObj = {
        fn: `navigateTo('` + route + `', '` + xParamString + `')`,
        params: params
      };
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
    var footer = App.html("footer.html")
    var keys = Object.keys(match_2[0])
    $("html")[0].scrollIntoView()


    if (keys.includes("skipNav")) {
      $("#main_content").html(html + footer)
      renderCallback()

    } else {
      var nav = App.html("blog_nav.html")

      if (keys.includes("customNav")) {
        var nav = App.html(match_2[0].customNav)
      }

      $("#main_content").html(nav)
      $("#main_content").append(html + footer)
      renderCallback()

    }


    return match_2[0]
  } else {
    var html = App.html("landing.html")
    var nav = App.html("blog_nav.html")
    $("#main_content").html(nav)
    $("#main_content").append(html + footer)
    renderCallback()

  }


}


/*-------------------------------
 //  WOW
-------------------------------*/
const wow = new WOW({
  boxClass: "wow",
  animateClass: "animated",
  offset: 0,
  mobile: false,
  live: true,
  scrollContainer: null,
});


function templateSearch() {
  /*-----------------------------------
  //  Jquery Serch Box
  -----------------------------------*/
  $('a[href="#template-search"]').on("click", function(event) {
    event.preventDefault();
    const target = $("#template-search");
    target.addClass("open");
    setTimeout(function() {
      target.find("input").focus();
    }, 600);
    return false;
  });

  $("#template-search, #template-search button.close").on(
    "click keyup",
    function(event) {
      if (
        event.target === this ||
        event.target.className === "close" ||
        event.keyCode === 27
      ) {
        $(this).removeClass("open");
      }
    }
  );

}


function sliders() {
  /*-------------------------------------
  // Trending slider
  ------------------------------------*/
  const rtTrendingSlider1 = new Swiper(".rt-treding-slider1", {
    slidesPerView: 1,
    loop: true,
    slideToClickedSlide: true,
    direction: "vertical",
    autoplay: {
      delay: 4000,
    },
    speed: 800,
  });

  /*-------------------------------------
  // banner-slider-thumbnail-style-2
  ------------------------------------*/

  const bannerSliderThumbnailStyle2 = new Swiper(
    ".banner-slider-thumbnail-style-2", {
      slidesPerView: 3,
      slideToClickedSlide: true,
      spaceBetween: 20,
      loop: true,
      speed: 1000,
      direction: "horizontal",
      mousewheel: true,

      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 2,
          direction: "vertical",
          pagination: {
            el: ".swiper-pagination",
            type: "progressbar",
          },
          // centeredSlides: true,
        },
        1200: {
          slidesPerView: 3,
          direction: "vertical",
          pagination: {
            el: ".swiper-pagination",
            type: "progressbar",
          },
        },
      },
    }
  );
  const bannerSliderStyle2 = new Swiper(".banner-slider-style-2", {
    loop: true,
    speed: 1000,
    thumbs: {
      swiper: bannerSliderThumbnailStyle2,
    },
  });

  /*-------------------------------------
  // banner-slider-thumbnail-style-2
  ------------------------------------*/

  var bannerSliderThumbnailStyle3 = new Swiper(
    ".banner-slider-thumbnail-style-3", {
      slidesPerView: 3,
      spaceBetween: 20,
      loop: true,
      speed: 1000,

      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        1025: {
          slidesPerView: 2,
        },
        1400: {
          slidesPerView: 3,
          centeredSlides: true,
        },
      },
    }
  );
  var bannerSliderStyle3 = new Swiper(".banner-slider-style-3", {
    loop: true,
    speed: 1000,
    thumbs: {
      swiper: bannerSliderThumbnailStyle3,
    },
    navigation: {
      nextEl: ".btn-next-thumb",
      prevEl: ".btn-prev-thumb",
    },
    effect: 'fade',
    autoplay: {
      delay: 6000
    }
  });


  /*-------------------------------------
  // video Thumbnail slider
  ------------------------------------*/

  const videoSliderThumbnailStyle1 = new Swiper(
    ".video-slider-thumbnail-style-1", {
      loop: true,
      spaceBetween: 10,
      slidesPerView: 4,
      watchSlidesVisibility: true,
      watchSlidesProgress: true,
      speed: 800,
      pagination: {
        el: ".swiper-pagination",
        type: "progressbar",
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
        },
        576: {
          slidesPerView: 1,
        },
        768: {
          slidesPerView: 2,
        },
        992: {
          slidesPerView: 2,
        },
        1200: {
          slidesPerView: 3,
        },
        1400: {
          slidesPerView: 4,
        },
      },
    }
  );
  const videoSliderStyle1 = new Swiper(".video-slider-style-1", {
    loop: true,
    speed: 800,
    thumbs: {
      swiper: videoSliderThumbnailStyle1,
    },
  });

}

function setDate() {
  /*--------------------------------
   // Date
   -------------------------------*/
  const currentYear = document.querySelectorAll(".currentYear");
  if (currentYear.length > 0) {
    const date = new Date();
    const currYear = date.getFullYear();
    currentYear.forEach((ele) => {
      ele.innerText = currYear;
    });
  }

  const currentDate = document.querySelectorAll(".currentDate");
  if (currentDate.length > 0) {
    const date = new Date().toLocaleDateString("en-us", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    currentDate.forEach((ele) => {
      ele.innerText = date;
    });
  }
}

function mobileToggle() {
  if ($(".rt-slide-nav").is(":visible")) {
    $(".rt-slide-nav").slideUp();
    $("body").removeClass("slidemenuon");
  } else {
    $(".rt-slide-nav").slideDown();
    $("body").addClass("slidemenuon");
  }
}

function setHeader() {
  // Fixed header
  $(window).on("scroll", function() {
    if ($("header").hasClass("sticky-on")) {
      const stickyPlaceHolder = $("#sticky-placeholder"),
        menu = $("#navbar-wrap"),
        menuH = menu.outerHeight(),
        topbarH = $("#topbar-wrap").outerHeight() || 0,
        targrtScroll = topbarH,
        header = $("header");
      if ($(window).scrollTop() > targrtScroll) {
        header.addClass("sticky");
        stickyPlaceHolder.height(menuH);
      } else {
        header.removeClass("sticky");
        stickyPlaceHolder.height(0);
      }
    }
  });
  // Fixed header mobile
  $(window).on("scroll", function() {
    if ($(".rt-mobile-header").hasClass("mobile-sticky-on")) {
      const stickyPlaceHolder = $("#mobile-sticky-placeholder"),
        menu = $("#mobile-menu-bar-wrap"),
        menuH = menu.outerHeight(),
        topbarH = $("#mobile-top-bar").outerHeight() || 0,
        targrtScroll = topbarH,
        header = $(".rt-mobile-header");
      if ($(window).scrollTop() > targrtScroll) {
        header.addClass("mobile-sticky");
        stickyPlaceHolder.height(menuH);
      } else {
        header.removeClass("mobile-sticky");
        stickyPlaceHolder.height(0);
      }
    }
  });

  // humburger
  $(".humburger").on("click", function() {
    $(".humburger").toggleClass("active");
  });



  /*-------------------------------------
    Mobile Menu Dropdown
    -------------------------------------*/
  const rtMobileMenu = $(".offscreen-navigation .menu");

  if (rtMobileMenu.length) {
    rtMobileMenu.children("li").addClass("menu-item-parent");
    rtMobileMenu.find(".menu-item-has-children > a").on("click", function(e) {
      e.preventDefault();
      $(this).toggleClass("opened");
      const n = $(this).next(".sub-menu"),
        s = $(this).closest(".menu-item-parent").find(".sub-menu");
      rtMobileMenu
        .find(".sub-menu")
        .not(s)
        .slideUp(250)
        .prev("a")
        .removeClass("opened"),
        n.slideToggle(250);
    });
    rtMobileMenu
      .find(".menu-item:not(.menu-item-has-children) > a")
      .on("click", function(e) {
        $(".rt-slide-nav").slideUp();
        $("body").removeClass("slidemenuon");
      });
  }
}

function windowLoad() {
  /*-------------------------------------
  Window Load and Resize
  -------------------------------------*/
  $(window).on("load", function() {
    console.log("finish loading..")
    // Modal
    if ($(window).width() > 992) {
      $("#rtModal").modal("show");
    }

    // video pop up
    var videoPopUp = $(".play-btn");
    if (videoPopUp.length) {
      videoPopUp.magnificPopup({
        type: "iframe",
        iframe: {
          markup: '<div class="mfp-iframe-scaler">' +
            '<div class="mfp-close"></div>' +
            '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' +
            "</div>",
          patterns: {
            youtube: {
              index: "youtube.com/",
              id: "v=",
              src: "https://www.youtube.com/embed/%id%?autoplay=1",
            },
            vimeo: {
              index: "vimeo.com/",
              id: "/",
              src: "//player.vimeo.com/video/%id%?autoplay=1",
            },
            gmaps: {
              index: "//maps.google.",
              src: "%id%&output=embed",
            },
          },
          srcAction: "iframe_src",
        },
      });
    }

  });

  $(window).on("load resize", function() {
    // Masonry
    $(".masonry-items").masonry({
      itemSelector: ".masonry-item",
      columnWidth: ".masonry-item",
    });
  });

  // Page Preloader
  var preloader = $("#preloader");
  preloader &&
    $("#preloader").fadeOut("slow", function() {
      $(this).remove();
    });

  $(".rt-slide-nav").slideUp();
  $("body").removeClass("slidemenuon");
}

function renderCallback() {
  populate_menus()
  checkLoginUser();
  App.hide()
  templateSearch();
  sliders()
  setDate()

  setHeader()
  windowLoad()
  try {
    cachePage()
    wow.init();
  } catch (e) {

  }
}

function updatePageParams(obj) {
  window.stateObj = obj
  history.pushState(obj, obj.title, obj.route);
}

function memberLogin() {
  App.modal({
    selector: "#transparentModal",
    autoClose: false,
    header: 'Login',
    content: `

      <div id="firebaseui-auth-container"></div>
    `

  })
  ui.start('#firebaseui-auth-container', {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        window.user = authResult.user
        window.userToken = authResult.user.uid
        var res = App.post("google_signin", {
          result: {
            uid: authResult.user.uid,
            email: authResult.user.email,
            name: authResult.user.displayName
          }
        })
        window.userToken = res
        localStorage.setItem("pkey", res)
        checkLoginUser();
        navigateTo("/home")
        $("#transparentModal").modal('hide')
        $("#axr").find("span[aria-label='displayName']").html("Hi, " + authResult.user.displayName)
        App.notify("Welcome back!")

      },
      uiShown: function() {
        App.hide();
      }
    },
    signInFlow: 'popup',
    signInSuccessUrl: '/home',
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
  });
}

function logout() {
  localStorage.removeItem("pkey")
  navigateTo("/home")

  window.userToken = null
  App.notify("Logout")
}

function checkLoginUser() {
  if (localStorage.getItem("pkey") != null) {
    window.userToken = localStorage.getItem("pkey")

    var pdata = App.api("get_member_profile", {
      token: window.userToken
    }, () => {
      window.member = null
      localStorage.removeItem("pkey")

      window.userToken = null
      App.notify("Logout")
    })
    window.pdata = pdata
    window.member = pdata
    $("span[aria-label='displayName']").html("Hi, " + pdata.name)

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
    return cat.parent && cat.parent.name == cat.name
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

function checkLogin() {
  if (localStorage.pkey != null) {
    navigateTo("/account")
  } else {
    memberLogin()
  }

}

function populate_directory() {
  try {

    var al4 = categories.filter((v, i) => {
      return v.name == '会长心语'
    })[0]
    al4_link = `
    <a href="/blog_listing/` + al4.id + `/` + al4.name + `" class="navi btn btn-outline-secondary">View More</a>
    `
  } catch (e) {

  }


  var al3 = categories.filter((v, i) => {
    return v.name == '讲座'
  })[0]
  al3_link = `
    <a href="/blog_listing/` + al3.id + `/` + al3.name + `" class="navi btn btn-outline-secondary">View More</a>
    `
  var al2 = categories.filter((v, i) => {
    return v.name == 'e_southernbell'
  })[0]
  al2_link = `
    <a href="/blog_listing/` + al2.id + `/` + al2.name + `" class="navi btn btn-secondary">View More</a>
    `

  var directories = App.api("get_directory", {})
  $("ul.quick-links").html('')
  var list = [
    "会长心语",
    "关于我们",
    "年会组织",
    "卫理堂会",
    "派司名单",
    "南钟报",
    "年会活动",
    "寻找 Search",
  ]

  list.forEach((lv, i) => {

    try {



      if (lv == "年会活动") {
        var li = ` <li class="">
        <a class="animation navi" href="/blog_listing/` + al3.id + `/` + al3.name + `" >年会活动</a>
      </li>`

        $("ul.quick-links").append(li)


        var li = ` <li class="navi nav-item">
        <a class="nav-link" href="/blog_listing/` + al3.id + `/` + al3.name + `" >年会活动</a>
      </li>`

        $("#nav_items").append(li)

      } else {

        var v = directories.filter((z, ii) => {
          return z.title == lv
        })[0]
        var li = ` <li class="navi nav-item">
        <a class="nav-link" href="/pages/` + v.id + `/` + v.title + `" >` + v.title + `</a>
      </li>`

        $("ul.quick-links").append(li)


        var li = ` <li class="navi nav-item">
        <a class="nav-link" href="/pages/` + v.id + `/` + v.title + `" >` + v.title + `</a>
      </li>`

        $("#nav_items").append(li)
      }

    } catch (e) {
      console.log(e)

    }

  })

  // var li = ` 

  //   <li class=" nav-item">
  //     <a id="axr" onclick="checkLogin()" style="cursor: pointer;" class="  nav-link "> 
  //     <i class="fa fa-user pe-2"></i>
  //     <span aria-label='displayName'>Profile</span> </a>
  //   </li>
  //   `
  // $("#nav_items").append(li)
  // $(".quick-links").append(li)

}

function populate_footer() {
  // var groups = App.api("list_groups", {})
  // $("ul[aria-label='cac-directory']").html('')
  // groups.forEach((g, i) => {
  //   var li = `<li>
  //     <a href="javascript:void(0);">
  //       <i class=""></i>` + g.name + `</a>
  //       </li>`
  //   $("ul[aria-label='cac-directory']").append(li)
  // })
  var dt = new Date()
  var edate = dt.toGMTString().split(",")[1].split(" ").splice(0, 4).join(" ")
  $("#tedate").html(edate)
}