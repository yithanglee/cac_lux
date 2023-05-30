var categories = App.api("blog_categories", {})
var route_names = [{
    html: "landing.html",
    title: "Home - 马来西亚基督教 卫理公会华人年议会",
    route: "/home"
  },
  // {
  //   html: "account.html",
  //   title: "Account - 马来西亚基督教 卫理公会华人年议会",
  //   route: "/account"
  // }, 
  // {
  //   html: "event_listing.html",
  //   title: "Events - 马来西亚基督教 卫理公会华人年议会",
  //   route: "/event_listing/:id/:title"
  // }, 
  // {
  //   html: "event_show.html",
  //   title: "Event - 马来西亚基督教 卫理公会华人年议会",
  //   route: "/events/:id/:title"
  // }, 
  {
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
    route: "/pages/:id/:title"
    // customNav: "blog_nav_sub.html"
  }, {
    html: "privacy_policy.html",
    title: "Privacy Policy - 马来西亚基督教 卫理公会华人年议会",
    route: "/privacy_policy",
    skipNav: true
  }
]

function navigateTo(route, additionalParamString, dom) {

  if ($("#preloader").length == 0) {

    $("#main_content").before(`  <div class="pre-loader" id="preloader">
    <div class="loader"></div>
  </div>`)
  }
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
    document.documentElement.scrollTop = 0;
      

  } catch (e) {

  }
}



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



        var li = ` <li class="">
        <a class="animation navi" href="/blog_listing/` + cat.id + `/` + cat.name + `" >` + cat.name + `</a>
      </li>`

        $("ul.quick-links").append(li)

        var li = `<li class="widget-list-item">
                <a href="/blog_listing/` + cat.id + `/` + cat.name + `" class="navi widget-list-link">
                 ` + cat.name + `
                </a>
              </li>

        `
        $(".a.cat-list").append(li)


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
    "资源分享",
    "寻找 Search",
  ]

  list.forEach((lv, i) => {

    try {

      if (lv == "寻找 Search") {
        window.searchPage = directories.filter((v, i) => {
          return v.title == lv
        })[0]
      }

      if (lv == "年会活动") {
        var li = ` <li class="">
        <a class="animation navi" href="/blog_listing/` + al3.id + `/` + al3.name + `" >年会活动</a>
      </li>`

        $("ul.quick-links").append(li)
        $(".menu.a").append(li)


        var li = ` <li class="">
        <a class="animation navi" href="/blog_listing/` + al3.id + `/` + al3.name + `" >年会活动</a>
      </li>`

        $("#nav_items").append(li)


      } else if (lv == "资源分享") {

  var al4 = categories.filter((v, i) => {
    return v.name == '资源分享'
  })[0]
        var li = ` <li class="">
        <a class="animation navi" href="/blog_listing/` + al4.id + `/` + al4.name + `" >资源分享</a>
      </li>`

        $("ul.quick-links").append(li)
        $(".menu.a").append(li)


        var li = ` <li class="">
        <a class="animation navi" href="/blog_listing/` + al4.id + `/` + al4.name + `" >资源分享</a>
      </li>`

        $("#nav_items").append(li)


      } else {

        var v = directories.filter((z, ii) => {
          return z.title == lv
        })[0]
        var li = ` <li class="">
        <a class="animation navi" href="/pages/` + v.id + `/` + v.title + `" >` + v.title + `</a>
      </li>`

        $("ul.quick-links").append(li)
        $(".menu.a").append(li)

        var li = `<li class="widget-list-item">
                <a href="/pages/` + v.id + `/` + v.title + `" class="navi widget-list-link">
                 ` + v.title + `
                </a>
              </li>

        `
        $(".a.cat-list").append(li)


        var li = ` <li class="">
        <a class="animation navi" href="/pages/` + v.id + `/` + v.title + `" >` + v.title + `</a>
      </li>`

        $("#nav_items").append(li)
      }

    } catch (e) {
      console.log(e)

    }

  })

}

function populate_highlight_media(section) {
  // query the is1,2,3 etc
  // each of it append to the instagram grid
  var me = window.isg.filter((v, i) => {
    return v.section == section
  })[0]

  if (me != null) {

    App.modal({ header: "Preview", content: `<div class="d-flex justify-content-center">

                               <div style="
         
                            overflow: hidden;
                            cursor: pointer;
                            background: #C04848;
                            background: url('` + me.media.s3_url + `');
                            height: 70vh;
                            width: 70vw;
                            background-size: contain;
                            background-repeat: no-repeat;
                            background-position: center;">
    </div>`, selector: "#transparentModal" , autoClose: false})
  }


}

function populate_footer() {

  var dt = new Date()
  var edate = dt.toGMTString().split(",")[1].split(" ").splice(0, 4).join(" ")
  $("#tedate").html(edate)

  window.isg = App.api("instagram_grid", {})
   $(".insta-gallery").html('')
  window.isg.forEach((v, i) => {


    media = v.media

    if (media != null) {

      $(".insta-gallery").append(

        `
              <div class="galleryitem">
                <a href="javascript:void(0);" onclick="populate_highlight_media('` + v.section + `')">
                               <div style="
         
                            overflow: hidden;
                            cursor: pointer;
                            background: #C04848;
                            background: url('` + v.media.s3_url + `');
                            height: 90px;
                            width: 100px;
                            background-size: cover;
                            background-repeat: no-repeat;
                            background-position: center;">
                </div>
                </a>
              </div>
`
      )

    }


  })

  window.cacps = App.api("blogs", { category: "会长心语", limit: 2 })
  $("#cacp").html("")
  window.cacps.forEach((blog, i) => {
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }
    var cacp = `

          
              <div class="item">
                <div class="rt-post post-sm white-style">
                  <div class="post-img">
                    <a class="navi" href="/blogs/` + blog.id + `/` + blog.title + `">
                      <div 

                       style="
                       clip-path: circle(50% at 50% 50%);
                                  overflow: hidden;
                                  cursor: pointer;
                                  background: #C04848;
                                  background: url('` + url + `');
                                  height: 100px;
                                  width: 100px;
                                  background-size: cover;
                                  background-repeat: no-repeat;
                                  background-position: center;"

                      >
                      </div>
                    </a>
                  </div>
                  <div class="ms-3 post-content">
                    <h4 class="post-title">
                      <a class="navi" href="/blogs/` + blog.id + `/` + blog.title + `">
                        ` + blog.title + `
                      </a>
                    </h4>
                    <span class="rt-meta">
                      <i class="far fa-calendar-alt icon"></i>
                      <span class="format_date">` + blog.inserted_at + `</span>
                    </span>
                  </div>
                </div>
              </div>

  `
    $("#cacp").append(cacp)

  })

}

let CacBlog = {
  chipBlog(blog) {
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }

    return `
            <div class="col-xl-3 col-md-6 wow fadeInUp" data-wow-delay="200ms" data-wow-duration="800ms">
          <div class="rt-post post-sm style-1">
            <div class="post-img">
              <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                <div 

                 style="
                 clip-path: circle(50% at 50% 50%);
                            overflow: hidden;
                            cursor: pointer;
                            background: #C04848;
                            background: url('` + url + `');
                            height: 100px;
                            width: 100px;
                            background-size: cover;
                            background-repeat: no-repeat;
                            background-position: center;"

                >
                </div>
              </a>
            </div>
            <div class="ms-4 post-content">
              <a  href="/blog_listing/` + blog.category_id + `/` + blog.title + `" class="navi rt-post-cat-normal">CAC</a>
              <h3 class="post-title">
                <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                  ` + blog.title + `
                </a>
              </h3>
              <span class="rt-meta">
                <i class="far fa-calendar-alt icon"></i>
                <span class="format_date">` + blog.inserted_at + `</span>
              </span>
            </div>
          </div>
        </div>
`
  },
  videoSlider(blog) {
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }
    return `
        <div class="swiper-slide">
          <div class="item  video-slide" data-bg-image="` + url + `">
            <div class="container">
              <div class="row justify-content-center">
                <div class="col-xl-7 col-lg-8 col-md-10">
                  <div class="post-content text-center">
                    <a  href="/blog_listing/` + blog.category_id + `/` + blog.title + `" class="navi rt-post-cat-normal text--white">CAC</a>
                    <h2 class="post-title bold-underline">
                      <a href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                           ` + blog.title + `
                      </a>
                    </h2>
                    <div class="post-meta">
                      <ul class="justify-content-center">
                        <li>
                          <span class="rt-meta">
                            <i class="far fa-calendar-alt icon"></i>
                            <span class="format_date"> ` + blog.inserted_at + `</span>
                          </span>
                        </li>
                        <li>
                          <span class="rt-meta">
                            <i class="fas fa-user icon"></i>
                            CAC President
                          </span>
                        </li>
                        
                      </ul>
                    </div>
                    <div class="btn-wrap mt--30 d-none">
                      <a href="http://www.youtube.com/watch?v=1iIZeIy7TqM" class="play-btn play-btn-primary">
                        <i class="fas fa-play"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- end swiper-slide -->
  `
  },
  thumbnailVideoSlider(blog) {
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }
    return `

            <div class="swiper-slide">
              <div class="item video-slide-thumb">
                <div class="rt-post post-sm post-thumb">
                  <div class="post-img">
                    <div class="su" style="

                      overflow: hidden;
                      cursor: pointer;
                      background: #C04848;
                      background: url('` + url + `');
                      height: 100px;
                      width: 130px;
                      background-size: cover;
                      background-repeat: no-repeat;
                      background-position: center;">
                    </div>
                  </div>
                  <div class="ms-3 post-content">
                    <span class="rt-post-cat-normal">CAC</span>
                    <h4 class="post-title">
                      <span class="title-ex">
                        ` + blog.title + `
                      </span>
                    </h4>
                    <span class="rt-meta">
                      <i class="far fa-calendar-alt icon"></i>
                      <span class="format_date"> ` + blog.inserted_at + `</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <!-- end thumb slide -->
  `
  },
  topStory(blog) {

    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }
    var ms = 200

    return `

        <div class="col-xl-3 col-md-6 wow fadeInUp" data-wow-delay="200ms" data-wow-duration="800ms">
          <div class="rt-post-grid grid-meta">
            <div class="post-img">
              <a   href="/blogs/` + blog.id + `/` + blog.title + `" class="navi"  >
              <div class="d-flex justify-content-center wow fadeInUp" data-wow-delay="` + ms + `ms" data-wow-duration="800ms" 
                  style="cursor: pointer;   position: relative; height: 240px;">

                <div 
                  class=" rounded py-2" style="
                  height: 240px;
                  width:  320px;
                  position: absolute;
                  background-position: center;
                  background-size: contain; 
                  filter: blur(10px); 
                  background-image: url('` + url + `');">
                </div>

          

                <div 
                  class="su rounded py-2" style="
                  height: 240px;
                  width:  320px;
                  background-position: center;
                  background-repeat: no-repeat;
                  background-size: contain; 
                  background-image: url('` + url + `');">
                </div>
              </div>
              </a>
            </div>
            <div class="post-content">
              <a href="/blog_listing/` + blog.category_id + `/` + blog.title + `" class="rt-post-cat-normal">CAC</a>
              <h3 class="post-title">
                <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                      ` + blog.title + `
                </a>
              </h3>
              <div class="post-meta">
                <ul>
                  <li>
                    <span class="rt-meta">
                      by <a href="author.html" class="name">CAC Author</a>
                    </span>
                  </li>
                  <li>
                    <span class="rt-meta">
                      <i class="far fa-calendar-alt icon"></i>
                      <span class="format_date"> ` + blog.inserted_at + `</span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
    
  `
  },
  tabContent(blogs, index) {

    var list = []


    blogs.forEach((blog, i) => {


      var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
      if (blog.img_url != null) {
        url = blog.img_url
      }
      var ms = 200

      list.push(`  <div class="col-12">
                          <div class="rt-post post-sm style-2">
                            <div class="post-content">
                              <a   href="/blog_listing/` + blog.category_id + `/` + blog.title + `" class="navi rt-post-cat-normal">CAC</a>
                              <h4 class="post-title">
                                <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                                  ` + blog.title + `
                                </a>
                              </h4>
                              <span class="rt-meta">
                                <i class="far fa-calendar-alt icon"></i>
                                <span class="format_date"> ` + blog.inserted_at + `</span>
                              </span>
                            </div>
                            <div class="post-img">
                              <a href="single-post1.html">
                                <div class="d-flex justify-content-center "
                                    style="cursor: pointer;   position: relative; height: 90px;">

                                  <div 
                                    class=" rounded py-2" style="
                                    width:  145px;
                                    height: 90px;
                                    position: absolute;
                                    background-position: center;
                                    filter: blur(10px); 
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>

                                  <div 
                                    class="su rounded py-2" style="
                                    width:  145px;
                                    height: 90px;
                                    background-position: center;
                                    background-repeat: no-repeat;
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>
                                </div>
                              </a>
                            </div>
                          </div>
                        </div>`)
    })

    var main = blogs[0]
    var ms = 200
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    try {

      if (main.img_url != null) {
        url = main.img_url
      }
      return `<div class="tab-pane tab-item animated fadeInUp ` + (index == 1 ? "show active" : "") + `" id="menu-` + index + `" role="tabpanel" aria-labelledby="menu-` + index + `-tab">
                    <div class="row gutter-24">
                      <div class="col-lg-7">
                        <div class="rt-post-overlay rt-post-overlay-lg">
                          <div class="post-img">
                            <a   href="/blogs/` + main.id + `/` + main.title + `" class="navi img-link">
                                  <div class="d-flex justify-content-center " 
                                      style="cursor: pointer;   position: relative; height: 520px;">

                                    <div 
                                      class=" rounded py-2" style="
                                      width:  520px;
                                      height: 520px;
                                      position: absolute;
                                      background-position: center;
                                      filter: blur(10px); 
                                      background-size: contain; 
                                      background-image: url('` + url + `');">
                                    </div>

                                    <div 
                                      class="su rounded py-2" style="
                                      width:  520px;
                                      height: 520px;
                                      background-position: center;
                                      background-repeat: no-repeat;
                                      background-size: contain; 
                                      background-image: url('` + url + `');">
                                    </div>
                                  </div>
                            </a>
                          </div>
                          <div class="post-content">
                            <a href="life-style.html" class="world">World</a>
                            <h3 class="post-title bold-underline">
                              <a  href="/blogs/` + main.id + `/` + main.title + `" class="navi">
                               ` + main.title + `
                              </a>
                            </h3>
                            <div class="post-meta">
                              <ul>
                                <li>
                                  <span class="rt-meta">
                                    by <a href="author.html" class="name">CAC Author</a>
                                  </span>
                                </li>
                                <li>
                                  <span class="rt-meta">
                                    <i class="far fa-calendar-alt icon"></i>
                                    <span class="format_date"> ` + main.inserted_at + `</span>
                                  </span>
                                </li>
                                <li>
                                  <span class="rt-meta">
                                    <i class="far fa-comments icon"></i>
                                    <a href="#"> 3,250</a>
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="col-lg-5">
                        <div class="row gutter-24">
                        ` + list.join("") + `
                        </div>
                      </div>
                    </div>
                  </div><!-- end ./tab item -->
    `
    } catch (e) {
      return ``
    }

  },
  tabHeader(cat, index) {
    return ` <li class="menu-item" role="presentation">
                    <a class="menu-link ` + (index == 1 ? "active" : "") + `" id="menu-` + index + `-tab" data-bs-toggle="tab" href="#menu-` + index + `" role="tab" aria-controls="menu-` + index + `" aria-selected="true"> ` + cat.name + ` </a>
                  </li>

  `
  },
  setWhatsNew(blogs, tabIndex, tabName) {

    $("#myTab").append(CacBlog.tabHeader({
      name: tabName,
    }, tabIndex))
    // $("#myTab").append(CacBlog.tabHeader({
    //   name: "Travel"
    // }, 2))
    // $("#myTab").append(CacBlog.tabHeader({
    //   name: "Food"
    // }, 3))
    // $("#myTab").append(CacBlog.tabHeader({
    //   name: "Tech"
    // }, 4))

    $("#myTabContent").append(CacBlog.tabContent(blogs, tabIndex))
    // $("#myTabContent").append(CacBlog.tabContent(blogs, 2))
    // $("#myTabContent").append(CacBlog.tabContent(blogs, 3))
    // $("#myTabContent").append(CacBlog.tabContent(blogs, 4))

  },
  setLargeCard(blog, index) {
    var ms = 200 * index
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }
    return `<div class="col-lg-6 wow fadeInUp" data-wow-delay="` + ms + `ms" data-wow-duration="800ms">
                  <div class="rt-post-overlay rt-post-overlay-md">
                    <div class="post-img">
                      <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi img-link">
                                <div class="d-flex justify-content-center " 
                                    style="cursor: pointer;   position: relative; height: 350px;">

                                  <div 
                                    class=" rounded py-2" style="
                                    width:  440px;
                                    height: 350px;
                                    position: absolute;
                                    background-position: center;
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>

                                  <div 
                                    class="su rounded py-2" style="
                                      width:  440px;
                                    height: 350px;
                                    backdrop-filter: blur(10px); 
                                    background-position: center;
                                    background-repeat: no-repeat;
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>
                                </div>
                      </a>
                    </div>
                    <div class="post-content">
                      <h3 class="post-title bold-underline">
                        <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                         ` + blog.title + `
                        </a>
                      </h3>
                      <div class="post-meta">
                        <ul>
                          <li>
                            <span class="rt-meta">
                              by <a href="author.html" class="name">CAC Author</a>
                            </span>
                          </li>
                          <li>
                            <span class="rt-meta">
                              <i class="far fa-calendar-alt icon"></i>
                              <span class="format_date"> ` + blog.inserted_at + `</span>
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
         
  `
  },
  setRowCard(blog, index) {
    var ms = 200 * index
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }

    return `<div class="post-item wow fadeInUp" data-wow-delay="200ms" data-wow-duration="800ms">
                <div class="rt-post post-md style-2 grid-meta">
                  <div class="post-img">
                    <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                                <div class="d-flex justify-content-center " 
                                    style="cursor: pointer;   position: relative; height: 250px;">

                                  <div 
                                    class=" rounded py-2" style="
                                    width:  360px;
                                    height: 250px;
                                    position: absolute;
                                    filter: blur(10px); 
                                    background-position: center;
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>

                         
                                  <div 
                                    class="su rounded py-2" style="
                                    width:  360px;
                                    height: 250px;
                          
                                    background-position: center;
                                    background-repeat: no-repeat;
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>
                                </div>
                    </a>
                  </div>
                  <div class="post-content">
                    <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">CAC</a>
                    <h3 class="post-title bold-underline">
                      <a href="single-post1.html">
                    ` + blog.title + `
                      </a>
                    </h3>
                    <p>
                      Ahen an unknown printer took a galley of type and scrambled imake
                      type specimen book has survived not only five centurie.
                    </p>
                    <div class="post-meta">
                      <ul>
                        <li>
                          <span class="rt-meta">
                            by <a href="author.html" class="name">CAC Author</a>
                          </span>
                        </li>
                        <li>
                          <span class="rt-meta">
                            <i class="far fa-calendar-alt icon"></i>
                            <span class="format_date"> ` + blog.inserted_at + `</span>
                          </span>
                        </li>
                        <li>
                          <span class="rt-meta">
                            <i class="fas fa-share-alt icon"></i>
                            3,250
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div class="btn-wrap mt--25">
                      <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi rt-read-more rt-button-animation-out">
                        Read More
                        <svg width="34px" height="16px" viewBox="0 0 34.53 16" xml:space="preserve">
                          <rect class="rt-button-line" y="7.6" width="34" height=".4">
                          </rect>
                          <g class="rt-button-cap-fake">
                            <path class="rt-button-cap" d="M25.83.7l.7-.7,8,8-.7.71Zm0,14.6,8-8,.71.71-8,8Z"></path>
                          </g>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <!-- end post-item -->

  `
  },
  setEventCard(blog, index) {
    var ms = 200 * index
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }
    return ` <div class="item">
                  <div class="rt-post post-sm style-1">
                    <div class="post-img">
                      <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
             
                      
                <div style="
                 clip-path: circle(50% at 50% 50%);
                            overflow: hidden;
                            cursor: pointer;
                            background: #C04848;
                            background: url('` + url + `');
                            height: 100px;
                            width: 100px;
                            background-size: cover;
                            background-repeat: no-repeat;
                            background-position: center;">
                </div>

                      </a>
                    </div>
                    <div class="ms-4 post-content">
                      <a href="/blog_listing/` + blog.category_id + `/` + blog.title + `" class="rt-post-cat-normal">CAC</a>
                      <h4 class="post-title">
                        <a href="single-post1.html">
                         ` + blog.title + `
                        </a>
                      </h4>
                      <span class="rt-meta">
                        <i class="far fa-calendar-alt icon"></i>
                       <span class="format_date"> ` + blog.inserted_at + `</span>
                      </span>
                    </div>
                  </div>
                </div>

      `
  },
  setTrailCard(blog, index) {

    var ms = 200 * index
    var url = '/images/daniel-tseng-QCjC1KpA4nA-unsplash.webp'
    if (blog.img_url != null) {
      url = blog.img_url
    }
    return `
                <div class="col-6">
                  <div class="rt-post-grid post-grid-md grid-meta">
                    <div class="post-img">
                      <a href="/blogs/` + blog.id + `/` + blog.title + `" class="navi"> 
                                <div class="d-flex justify-content-center " 
                                    style="cursor: pointer;   position: relative; height: 100px;">

                                  <div 
                                    class=" rounded py-2" style="
                                    width:  150px;
                                    height: 100px;
                                    position: absolute;
                                    filter: blur(10px); 
                                    background-position: center;
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>

                         
                                  <div 
                                    class="su rounded py-2" style="
                                    width:  150px;
                                    height: 100px;
                          
                                    background-position: center;
                                    background-repeat: no-repeat;
                                    background-size: contain; 
                                    background-image: url('` + url + `');">
                                  </div>
                                </div>
                      </a>
                    </div>
                    <div class="post-content">
                      <a href="/blog_listing/` + blog.category_id + `/` + blog.title + `" class="rt-post-cat-normal">CAC</a>
                      <h4 class="post-title">
                        <a  href="/blogs/` + blog.id + `/` + blog.title + `" class="navi">
                                 ` + blog.title + `
                        </a>
                      </h4>
                      <span class="rt-meta">
                        <i class="far fa-calendar-alt icon"></i>
                        <span class="format_date"> ` + blog.inserted_at + `</span>
                      </span>
                    </div>
                  </div>
                </div>

            `
  },
  populateSb() {
    $("ul.sb").html('')
    var sb =
      categories.filter((v, i) => {
        return v.name == "e_southernbell"
      })[0]

    var bg_images = ['joel-muniz-A4Ax1ApccfA-unsplash.webp', 'akira-hojo-_86u_Y0oAaM-unsplash.webp', 'bg2_new.webp', 'daniel-tseng-QCjC1KpA4nA-unsplash.webp', 'joel-muniz-A4Ax1ApccfA-unsplash.webp', 'akira-hojo-_86u_Y0oAaM-unsplash.webp', 'bg2_new.webp', 'daniel-tseng-QCjC1KpA4nA-unsplash.webp']
    sb.children.forEach((c, i) => {
      var div = `




        <li>
          <a  class="navi" href="/blog_listing/` + c.id + `/` + c.name + `" 
          data-bg-image="/images/` + bg_images[i] + `">
            <span class="cat-name">` + c.name + `</span>
            <span class="count">` + c.id + `</span>
          </a>
        </li>


  `
      if (c.name != "e_southernbell") {

        $("ul.sb").append(div)
        $("[data-bg-image]").each(function() {
          const img = $(this).data("bg-image");
          $(this).css({
            backgroundImage: "url(" + img + ")",
          });
        });

      }
    })
  },
  init(fullData) {

    fullData.forEach((data, i) => {
      blogs = data.blogs
      if (data.section == "l1") {
        blogs.forEach((blog, i) => {

          $("#l1").append(CacBlog.chipBlog(blog))
        })
      }
      if (data.section == "l2") {
        blogs.forEach((blog, i) => {

          $("#l2").append(CacBlog.videoSlider(blog))
        })
      }
      if (data.section == "l3") {
        blogs.forEach((blog, i) => {

          $("#l3").append(CacBlog.thumbnailVideoSlider(blog))
        })
      }
      if (data.section == "l4") {
        blogs.forEach((blog, i) => {

          $("#l4").append(CacBlog.topStory(blog))
        })
      }

      if (data.section == "l5") {

        CacBlog.setWhatsNew(blogs, 1, "CAC")

      }

      if (data.section == "l6") {
        blogs.forEach((blog, i) => {

          $("#n6").after(CacBlog.setRowCard(blog, i))
        })
      }
      if (data.section == "l7") {
        blogs.forEach((blog, i) => {

          $("#l7").append(CacBlog.setLargeCard(blog, i))
        })
      }
      if (data.section == "l8") {
        blogs.forEach((blog, i) => {

          $("#l8").append(CacBlog.setEventCard(blog, i))
        })
      }
      if (data.section == "l9") {
        blogs.forEach((blog, i) => {

          $("#l9").append(CacBlog.setTrailCard(blog, i))
        })
      }



    })


    CacBlog.populateSb()

    formatDate()
    $("[data-bg-image]").each(function() {
      const img = $(this).data("bg-image");
      $(this).css({
        backgroundImage: "url(" + img + ")",
      });
    });
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