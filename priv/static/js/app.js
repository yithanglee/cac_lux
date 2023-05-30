// for phoenix_html support, including form and button helpers
// copy the following scripts into your javascript bundle:
// * deps/phoenix_html/priv/static/phoenix_html.js

// this function need to run after the user form are created...
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ?
        true :
        decodeURIComponent(sParameterName[1]);
    }
  }
};

window.addEventListener(
  "popstate",
  function(event) {
    try {
      // supposing rerun the navigate?
      if (history.valueOf().state != null) {

        console.log(history.valueOf().state.fn)
        var adder = new Function(history.valueOf().state.fn);
        window.back = true;
        window.parsePage = true;

        adder();
      } else {
        App.notify("cant back")
        navigateTo("/home")
      }
    } catch (e) {
      // alert("!")

      console.log("!")
      // window.init();
    }
  },
  true
);



function setCurrentPage(fn_name, title) {
  App.show();
  var adder = new Function(fn_name);
  var stateObj = {
    fn: fn_name,
    title: title
  };
  $("title").html(title)
  history.pushState(stateObj, title, "?get=" + title);
  try {
    adder();
  } catch (e) {

    // setCurrentPage("window.init();", "Home")
    App.notify({
      message: "route not available"
    }, {
      type: "warning"
    })

  }
  App.hide();

}


window.phoenixModels = []

function imageIsLoaded(iSelector) {
  // alert(this.src);  // blob url
  // update width and height ...
  if (iSelector != null) {
    // img = $(iSelector)[0]
    $("img" + iSelector).show();
  } else {

    $("img#myImg").show();
  }
  App.notify("Image uploaded!", {
    type: "success"
  });
}
$(document).on("change", "input[type='file']", function() {
  if (this.files && this.files[0]) {
    // console.log()
    if (this.files[0].type.includes("video")) {
      var img = document.querySelector("#myVideo"); // $('img')[0]
      var url = URL.createObjectURL(this.files[0]); // set src to blob url
      // img.onload = imageIsLoaded;
      var source =
        '<source  src="' +
        url +
        '" type="video/mp4">Your browser does not support HTML video.';
      $("#myVideo").html(source);
      $("#myVideo").show();
    } else {
      var iSelector = $(this).attr("target")
      var img = document.querySelector("#myImg"); // $('img')[0]
      if (iSelector != null) {
        img = $(iSelector)[0]
      }
      img.src = URL.createObjectURL(this.files[0]); // set src to blob url
      img.onload = imageIsLoaded(iSelector);
    }
  }
});
$(document).on("click", ".dataTables_paginate", () => {
  console.log("scroll to dt")
  var element = $(".dataTable").closest(".table-responsive")[0]
  setTimeout(() => {

    element.scrollIntoView();
  }, 200)
})

function hashPW(pw) {
  var hashObj = new jsSHA("SHA-512", "TEXT", {
    numRounds: 1
  });
  hashObj.update(pw);
  var hash = hashObj.getHash("HEX");
  return hash;
}

function toggleActive(item, list) {
  list.forEach((v, i) => {
    v.active = false;
  })
  item.active = !item.active
}

let App = {

  reflect(formData) {
    var object = {};
    formData.forEach((value, key) => {

      console.log(key)
      var childMap = {}

      if (key.includes("\[")) {
        console.log("has child")
        var parent = key.split("\[")[0]
        var child = key.split("\[")[1].split("\]")[0]
        childMap[child] = value;
        object[parent] = { ...object[parent],
          ...childMap
        };

      } else {
        // Reflect.has in favor of: object.hasOwnProperty(key)
        if (!Reflect.has(object, key)) {
          object[key] = value;
          return;
        }
        if (!Array.isArray(object[key])) {
          object[key] = [object[key]];
        }
        object[key].push(value);
      }

    });
    return object;
  },
  form(dom, scope, successCallback, failedCallback) {
    var formData = new FormData($(dom)[0])
    formData.append("scope", scope)
    $.ajax({
        url: "/api/webhook",
        dataType: "json",
        headers: {
          "Authorization": "Basic " + window.userToken
        },
        method: "POST",
        enctype: "multipart/form-data",
        processData: false, // tell jQuery not to process the data
        contentType: false,
        data: formData
      })
      .done(function(j) {
        if (j.status == "ok") {
          App.notify("Added!", {
            type: "success"
          });
          try {
            if (j.res != null) {

              successCallback(j.res)
            }

          } catch (e) {

          }
        } else {
          App.notify("Not added!", {
            type: "danger"
          });
        }

      }).fail(() => {
        App.notify("Not added!", {
          type: "danger"
        });

      })

  },

  show() {
    $(".wrapper-ring").fadeIn()
    setTimeout(() => {
      $(".wrapper-ring").hide()
    }, 3000)
  },
  hide() {
    var t = $(".wrapper-ring")[0]
    if (t.offsetParent == null) {

    }
    $(".wrapper-ring").hide()
  },
  loading() {
    $(".wrapper-ring").toggle()

    setTimeout(() => {
      $(".wrapper-ring").hide()
    }, 3000)
  },


  toast(options) {
    var default_options = {
      selector: "#myToast",
      body: ".toast-body",
      title: ".toast-header",
      // foot: ".modal-footer",
      header: `<img src="/images/cac_logo_small.png" style="height: 35px;" class="rounded me-2" alt="...">
        <strong class="me-auto">CAC MY Methodist</strong>
        <small>0 mins ago</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>`,
      content: "Here is content for modal body",
      footer: "",
      drawFn: null,
      autoClose: true

    }

    var keys =
      Object.keys(default_options)
    keys.forEach((v, i) => {
      this[v] = default_options[v]
    })
    keys.forEach((v, i) => {
      if (options[v] != null) {
        this[v] = options[v]
      }
    })
    $(this.selector).find(this.title).html(this.header)
    $(this.selector).find(this.body).html(this.content)
    $(this.selector).find(this.foot).html(this.footer)
    // $(this.selector).modal("show")


    var toastElList = [].slice.call(document.querySelectorAll('.toast'))
    var toastList = toastElList.map(function(toastEl) {
      return new bootstrap.Toast(toastEl, {
        autohide: false
      }).show()
    })

    this.drawFn();
    if (this.autoClose) {
      setTimeout(() => {
        $(this.selector).modal("hide")
      }, 5000);
    }


  },
  modal(options) {

    var default_options = {
      selector: "#myModal",
      body: ".modal-body",
      title: ".modal-title",
      foot: ".modal-footer",
      header: "Modal Header",
      content: "Here is content for modal body",
      footer: "",
      drawFn: resetModal,
      autoClose: true

    }

    var keys =
      Object.keys(default_options)
    keys.forEach((v, i) => {
      this[v] = default_options[v]
    })
    keys.forEach((v, i) => {
      if (options[v] != null) {
        this[v] = options[v]
      }
    })
    $(this.selector).find(this.title).html(this.header)
    $(this.selector).find(this.body).html(this.content)
    $(this.selector).find(this.foot).html(this.footer)
    $(this.selector).modal("show")

    this.drawFn();
    if (this.autoClose) {
      setTimeout(() => {
        $(this.selector).modal("hide")
      }, 5000);
    }
  },
  html(page) {
    $(".modal-body").each((i, v) => {
      $(v).html('')
    })
    var res = ""
    $.ajax({
      async: false,
      method: "get",
      url: "/html/v2/" + page
    }).done((j) => {
      res = j
    })
    return res;
  },
  api(scope, params, failed_callback, successCallback) {
    var res = ""
    $.ajax({
      async: false,
      method: "get",
      headers: {
        "Authorization": "Basic " + window.userToken
      },
      url: "/api/webhook?scope=" + scope,
      data: params
    }).done((j) => {
      if (successCallback != null) {

        successCallback(j)
      }
      res = j
    }).fail(function(e) {

      App.notify("Ops, somethings' not right!", {
        type: "danger"
      });
      App.show()
      setTimeout(() => {

        if (failed_callback != null) {
          failed_callback()
        }
        App.hide()
      }, 500)

    });
    return res;
  },
  post(scope, params, failed_callback, successCallback) {
    var res = ""
    $.ajax({
      async: false,
      method: "post",
      headers: {
        "Authorization": "Basic " + window.userToken
      },
      url: "/api/webhook?scope=" + scope,
      data: params
    }).done((j) => {
      if (successCallback != null) {

        successCallback(j)
      }
      res = j
    }).fail(function(e) {

      App.notify("Ops, somethings' not right!", {
        type: "danger"
      });
      App.show()
      setTimeout(() => {

        if (failed_callback != null) {
          failed_callback()
        }
        App.hide()
      }, 500)

    });
    return res;
  },
  notify(message, options) {
    if (options == null) {
      options = {}
    }
    // var default_options = {
    //   static: false,
    //   type: 'danger'
    // }
    var default_options = {
      delay: 2000,
      type: "info"
    }
    var keys = Object.keys(default_options)
    keys.forEach((v, i) => {
      this[v] = default_options[v]
    })
    keys.forEach((v, i) => {
      if (options[v] != null) {
        this[v] = options[v]
      }
    })

    // var html = `
    //         <div class="alert alert-dismissible alert-` + this.type + `">
    //           <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    //           ` + message + `
    //         </div>
    //     `
    // $("nav[aria-label='breadcrumb']").before(html)
    // $(".alert").each((i, v) => {
    //   setTimeout(function() {
    //     $(v).fadeOut()
    //     setTimeout(function() {
    //       $(v).remove()
    //     }, 2000)
    //   }, 5000)

    // })
    var obj = {}
    var message_obj = {}

    if (typeof message == 'object') {
      message_obj = message
    } else {
      message_obj = {
        message: message
      }
    }

    var default_obj = {
      message: "Your text here",
      title: "System Message:",
      icon: "fa fa-exclamation-circle"
    }

    var keys = Object.keys(default_obj)
    keys.forEach((v, i) => {
      obj[v] = default_obj[v]
    })
    keys.forEach((v, i) => {
      if (message_obj[v] != null) {
        obj[v] = message_obj[v]
      }
    })
    console.log(obj)

    $.notify(obj, options)
  },
  Page: {
    createTable(id, dom) {
      var html = `
            <div class="table-responsive">
                <table class="table"  style="width: 100%;" id="` + id + `">
                    <thead></thead>
                    <tbody></tbody>
                </table>
            </div>
      `
      $(dom).append(html)
    },
    tablist(dom, list, title) {
      var left_tab = []
      var right_tab = [
        `
          <div class="tab-pane fade active show" id="initial" role="tabpanel" aria-labelledby="initial-tab" href="#initial">
          <div class="d-flex justify-content-center align-items-center" style="height: 400px;">
             <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          </div>
          `
      ]
      list.forEach((v, i) => {

        var a = `<button  
                                class="d-none p-2 d-flex justify-content-between align-items-center nav-link  text-center  "       
                                id="` + v.title + `-tab"
                                data-bs-toggle="pill"  
                                data-bs-target="#` + v.title + `"
                                type="button"
                                role="tab" > 
                                <i class="` + v.icon + `"> </i>
                                
                            <span class="px-3">` + v.title + `</span>
                            </button>`
        left_tab.push(a)

        var b = `

                        <div class="tab-pane fade " 
                        id="` + v.title + `"
                        role="tabpanel" 
                        aria-labelledby="` + v.title + `-tab"
                      
                        >
                            ` + v.content + `
                            
                        </div>
                `
        right_tab.push(b)
      })


      $(dom).html(`
                    <div class="row" >
                      <div class="col-lg-2 col-12 px-4 px-lg-0  pb-4 nav flex-column nav-pills mx-2" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                        ` + left_tab.join("") + `
                      </div>
                      <div class="col-lg-9 col-12 tab-content" id="v-pills-tabContent">
                        ` + right_tab.join("") + `
                      </div>
                    </div>
                `)



      $("#v-pills-tab button ").on("click", function(e) {
        var id = $(this).attr("id")
        var crumb = id.split("-tab")[0]
        $("#crumb").html(` <span class="text-primary fs-5">/ ` + crumb + `</span>`)
      })
      if (title == null) {
        title = ""
      }
      $(dom).before(`<div class="d-flex gap-1 align-items-center fs-5">
        <span class="">` + title + `</span>
        <span id="crumb"></span>
      </div>`)

      $("#v-pills-tab button").each((ii, v) => {
        $(v).toggleClass("d-none")
        if ($("#v-pills-tab button").length == (ii + 1)) {
          $("#v-pills-tab button")[0].click()
        }
        setTimeout(() => {}, (20 * ii) + 1)
      })
      setTimeout(() => {}, 1)


    },
    scrollProgressBar(dom_selector) {

      var divider;
      try {
        divider = $("label[data-label='editor-pick']").closest(".row")[0].offsetTop
      } catch (e) {
        divider = $(document).height()
      }

      var getMax = function() {
        return divider - $(window).height();
      };

      var getValue = function() {
        return $(window).scrollTop();
      };

      var progressBar = $(dom_selector),
        max = getMax(),
        value,
        width;

      var getWidth = function() {
        // Calculate width in percentage
        value = getValue();
        width = (value / max) * 100;
        width = width + "%";
        return width;
      };

      var setWidth = function() {
        progressBar.css({
          width: getWidth()
        });
      };

      $(document).on("scroll", setWidth);
      $(window).on("resize", function() {
        // Need to reset max
        max = getMax();
        setWidth();
      });
    }
  },

  Functions: {
    printReport(title, filename, break_table, subModal) {
      var hostname = window.location.hostname
      var content = $("#print_area").html()

      if (subModal) {
        content = $("#mySubModal").find(".modal-body").html()
      }

      var outerHTML = `
            <div class="container" style="left: 0px; position: absolute;">
                <div class="row">` + content + `</div>
            </div>
        `

      if (break_table != null) {
        if (break_table) {
          outerHTML = `
                <div class="container" style="">
                    ` + content + `
                </div>
            `
        }
      }
      $.ajax({
        url: "/api/webhook",
        data: {
          scope: "print",
          title: title,
          filename: filename,
          html: outerHTML,
          hostname: hostname
        },
        headers: {
          "Authorization": "Basic " + window.userToken
        },
        method: "POST"
      }).done(function(link) {


        var lb = link.replace("localhost", hostname)
        window.open(lb, "_self")
        $('#print_area').html('')
        setTimeout(() => {

          App.hide()
        }, 1000)
      }).fail(function(e) {
        console.log(e.responseJSON.status);
        $.notify({
          icon: "fa fa-exclamation-circle",
          message: "Not Added! reason: " + e.responseJSON.status
        }, {
          type: "danger",
          timer: 1000,
          placement: {
            from: "bottom",
            align: "left"
          }
        });
      });;
      // opens the link in a new tab?
    },

    isFunction(functionToCheck) {
      return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
    },
    check_null(value) {
      if (value == null) {
        return "N/A"
      } else {
        return value

      }
    },
    reinit() {
      // var t = $(".dataTable").DataTable()
      // t.ajax.reload();

      $(".dataTable").each((i, v) => {
        if (v.offsetParent != null) {
          var phxModel = window.phoenixModels.filter((dv, di) => {
            return dv.tableSelector == "#" + v.id

          })[0]

          phxModel.reload();
        }
      })


    },
    convertPassword() {
      var u = document.querySelector("input[name='User[password]']")
      if (u != null) {
        u.addEventListener("change", () => {
          var v = u.value
          document.querySelector("input[name='User[crypted_password]']").value = hashPW(v)
          u.value = null
        })
      }

    }
  }
}

class routeData {
  constructor(options) {
    var default_options = {
      routeName: makeid(4),
      markerCoordinates: [
        [101.6987811, 3.04722],
        [101.6987811, 3.04722]
      ],
      markers: [],
      distance: 10.0,
      array: [
        [101.6987811, 3.04722],
        [101.6987811, 3.04722]
      ]
    }

    var keys =
      Object.keys(default_options)
    keys.forEach((v, i) => {
      this[v] = default_options[v]
    })
    keys.forEach((v, i) => {
      if (options[v] != null) {
        this[v] = options[v]
      }
    })

  }



}

class phoenixModel {
  constructor(options) {
    var default_options = {
      moduleName: "User",
      link: "users",
      tableSelector: "#users",
      data: {},
      allData: [],
      buttons: [],
      tableButtons: [],
      table: null,
      columns: [],
      customCols: null,
      aliasName: null,
      onDrawFn: null,
      makeid: {},
      xcard: null

    }

    var keys =
      Object.keys(default_options)
    keys.forEach((v, i) => {
      this[v] = default_options[v]
    })
    keys.forEach((v, i) => {
      if (options[v] != null) {
        this[v] = options[v]
      }
    })


    function loadDefaultGrid(object) {
      $(object.tableSelector).closest(".dataTables_wrapper").find(".grid_view .xc").each((ti, tv) => {
        var data = tv.data
        console.log("xcard..")
        if (object.xcard != null) {
          var res = object.xcard(data);
          $(tv).prepend(res)

        } else {
          var cols = []
          object.columns.forEach((v, i) => {
            var col = `
             <div class="d-flex flex-column pb-2" role="grid_data" aria-label="` + v.label + `"><label class="fw-light">` + v.label + `</label>` + dataFormatter(data, v) + `</div>`
            cols.push(col)
          })

          var div = document.createElement("div")
          div.className = " card"
          div.innerHTML = cols.join("")
          console.log("ts")
          console.log(div)

          $(tv).prepend(div)
        }

      })
    }


    this.load = function(makeid, dom) {
      if (makeid != null) {
        this.tableSelector = "#" + makeid
        this.makeid = {
          id: makeid,
          dom: dom
        }
        App.Page.createTable(makeid, dom)
      } else {
        App.Page.createTable(this.makeid.id, this.makeid.dom)
      }
      populateTable(this)
      this.table.on('draw', () => {

        // <---- this function used to populate the grid view button ---->
        $(this.tableSelector).closest(".table-responsive").find(".module_buttons").html(`
        <div class="d-flex align-items-center">
          <div class="dropdown morphing scale-left ">
                     <a href="#" class="more-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-h"></i></a>
                      <ul class="dropdown-menu dropdown-animation dropdown-menu-end shadow border-0">
                        <li><a class="dropdown-item" href="javascript:void(0);" onclick="toggleView('` + this.tableSelector + `')">Grid View<i class="fa fa-th-large"></i></a></li>
                        <li><a class="dropdown-item" href="javascript:void(0);" onclick="App.Functions.reinit()">Reload<i class="fa fa-repeat"></i></a></li>
                        <li><a class="dropdown-item" href="javascript:void(0);" data-href="" data-module="add_new" data-ref="">New
                        <i class="fa fa-arrow-right"></i></a></li>
                      </ul>
                    </div>
        </div>

                `)

        var nbutton = $(this.tableSelector).closest(".table-responsive").find(".module_buttons [data-module='add_new']");
        try {
          if (nbutton.length > 0) {
            var ts = this.tableSelector
            nbutton[0].onclick = function() {
              window.currentSelector = ts
              form_new(ts, {})
            }
          }
        } catch (e) {}
        // <---- this function used to populate the table button ---->
        this.tableButtons.forEach((b, i) => {
          var buttonz = new formButton({
              iconName: b.iconName,
              color: b.color,
              name: b.name
            },
            b.fnParams,
            b.onClickFunction);
          $(this.tableSelector).closest(".table-responsive").find(".module_buttons").prepend(buttonz)
        })
        // <---- this function used to populate the grid view button ---->
        populateGridView(this)
        loadDefaultGrid(this)
        if (this.onDrawFn != null) {
          this.onDrawFn();
        }




      })
      this.table.on('page', () => {
        // the prev page is meant for restoring the pagination after update...
        try {
          window.prev_page = this.table.page()
        } catch (e) {}

      })

    };

    this.reload = function() {
      var id = this.tableSelector.split("#")[1]
      var html = `
                <table class="table"  style="width: 100%;" id="` + id + `">
                    <thead></thead>
                    <tbody></tbody>
                </table>
          `
      // here will destroy all the datatable elements and reinsert a new 1
      $(this.tableSelector).closest(".table-responsive").html(html)
      // when populate table ... not sure if the data is passed along..
      console.log("reload dt")
      populateTable(this)
      try {
        this.table.on('draw', () => {


          // <---- this function used to populate the grid view button ---->
          $(this.tableSelector).closest(".table-responsive").find(".module_buttons").html(`
        <div class="d-flex align-items-center">
          <div class="dropdown morphing scale-left ">
                     <a href="#" class="more-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-h"></i></a>
                      <ul class="dropdown-menu dropdown-animation dropdown-menu-end shadow border-0">
                        <li><a class="dropdown-item" href="javascript:void(0);" onclick="toggleView('` + this.tableSelector + `')">Grid View<i class="fa fa-th-large"></i></a></li>
                        <li><a class="dropdown-item" href="javascript:void(0);" onclick="App.Functions.reinit()">Reload<i class="fa fa-repeat"></i></a></li>
                        <li><a class="dropdown-item" href="javascript:void(0);" data-href="" data-module="add_new" data-ref="">New<i class="fa fa-arrow-right"></i></a></li>
                      </ul>
                    </div>
        </div>

           `)

          var nbutton = $(this.tableSelector).closest(".table-responsive").find(".module_buttons [data-module='add_new']");
          try {
            console.log("dt table data")
            console.log(this.data)
            console.log(nbutton)
            if (nbutton.length > 0) {
              var ts = this.tableSelector
              nbutton[0].onclick = function() {
                window.currentSelector = ts
                form_new(ts, {})
              }
            }
          } catch (e) {}

          // <---- this function used to populate the table button ---->
          this.tableButtons.forEach((b, i) => {
            var buttonz = new formButton({
                iconName: b.iconName,
                color: b.color,
                name: b.name
              },
              b.fnParams,
              b.onClickFunction);
            $(this.tableSelector).closest(".table-responsive").find(".module_buttons").prepend(buttonz)
          })

          // <---- this function used to populate the grid view button ---->
          populateGridView(this)
          loadDefaultGrid(this)
          if (this.onDrawFn != null) {
            this.onDrawFn();
          }


        })
        this.table.on('init', () => {
          try {

            this.table.page(prev_page).draw('page')
          } catch (e) {}

        })

      } catch (e) {
        console.log(e)

      }

    };

  }

}

class SubModule {
  constructor(moduleName, link, customCols) {
    this.moduleName = moduleName;
    this.link = link;
    this.customCols = customCols;
  }
}


function populateTable(dataSource) {
  var custSorts = [
    [0, "desc"]
  ]
  var custPageLength = 10
  var custDom = '<"row align-items-center"<"col-lg-4"l><"gap-2 col-lg-8 text-center module_buttons d-flex justify-content-lg-end justify-content-center  py-2 py-lg-0">><"row grid_view d-block d-lg-none"><"list_view d-lg-block d-none"t><"row p-4"<"col-lg-6"i><"col-lg-6"p>>'
  if (dataSource.data.dom != null) {
    custDom = dataSource.data.dom
  }
  if (dataSource.data.sorts != null) {
    custSorts = dataSource.data.sorts
  }
  if (dataSource.data.pageLength != null) {
    custPageLength = dataSource.data.pageLength
  }

  var tr = document.createElement("tr");
  var ftr = document.createElement("tr");
  $(dataSource.columns).each(function(i, v) {
    var td = document.createElement("td");
    td.innerHTML = v.label;
    tr.append(td);
  });
  $(dataSource.columns).each(function(i, v) {
    var td = document.createElement("td");
    ftr.append(td);
  });

  $(dataSource.tableSelector).find("thead").append(tr);
  $(dataSource.tableSelector).find("tfoot").html(ftr);
  console.log(dataSource.data);
  var keys = Object.keys(dataSource.data);
  var xparams = [];
  $(keys).each((i, k) => {
    if (!["modalSelector", "sorts", "dom", "footerFn", "rowFn", "preloads", "grid_class"].includes(k)) {
      xparams.push("&" + k + "=" + dataSource.data[k]);
    }
    if (["preloads"].includes(k)) {
      xparams.push("&" + k + "=" + JSON.stringify(dataSource.data[k]));
    }
    if (["additional_join_statements"].includes(k)) {
      xparams.push("&" + k + "=" + JSON.stringify(dataSource.data[k]));
    }

  });

  var table_selector = dataSource.tableSelector;

  var table = $(table_selector).DataTable({

    pageLength: custPageLength,
    processing: true,
    responsive: true,
    serverSide: true,
    ajax: {
      url: "/api/" + dataSource.link + "?foo=bar" + xparams.join("")
    },
    columns: dataSource.columns,
    lengthMenu: [8, 10, 12, 25, 50, 100],
    rowCallback: function(row, dtdata, index) {
      var added = $(dataSource.allData).filter(function(i, v) {
        return v.id == dtdata.id;
      });
      if (added.length == 0) {
        dataSource.allData.push(dtdata);
      }
      $(row).addClass("d-none")
      $(row).attr("aria-index", index);
      lastCol = $(row).find("td").length - 1;

      ColumnFormater.datetime(row, dtdata, dataSource)
      ColumnFormater.img(row, dtdata, dataSource)
      ColumnFormater.bool(row, dtdata, dataSource)
      ColumnFormater.float(row, dtdata, dataSource)
      ColumnFormater.child(row, dtdata, dataSource)
      ColumnFormater.json(row, dtdata, dataSource)
      ColumnFormater.subtitle(row, dtdata, dataSource)
      ColumnFormater.progress(row, dtdata, dataSource)
      $("td:eq(" + lastCol + ")", row).attr("class", "td-actions text-end");
      $("td:eq(" + lastCol + ")", row).html("");
      $(dataSource.buttons).each((i, params) => {
        if (params.buttonType != null) {
          if (params.buttonType == "grouped") {
            console.log("creating grouped...button...")
            params.fnParams.dataSource = dataSource;
            params.fnParams.aParams = dataSource.data;
            var buttonz = new groupedFormButton(
              params.name,
              params.color,
              params.buttonList,
              params.fnParams
            );
            $("td:eq(" + lastCol + ")", row).append(buttonz);

          } else {
            params.fnParams.dataSource = dataSource;
            params.fnParams.aParams = dataSource.data;
            var buttonz = new formButton({
                iconName: params.iconName,
                color: params.color,
                name: params.name
              },
              params.fnParams,
              params.onClickFunction);
            $("td:eq(" + lastCol + ")", row).append(buttonz);
          }
        } else {

          params.fnParams.dataSource = dataSource;
          params.fnParams.aParams = dataSource.data;
          var buttonz = new formButton({
              iconName: params.iconName,
              color: params.color,
              name: params.name,
              tooltipText: params.tooltipText
            },
            params.fnParams,
            params.onClickFunction
          );
          $("td:eq(" + lastCol + ")", row).append(buttonz);
        }
      });
      if (dataSource.data.rowFn != null) {
        dataSource.data.rowFn(row, dtdata, index)
      }
    },
    footerCallback: function(row, data, start, end, display) {
      if (dataSource.data != null) {
        if (dataSource.data.footerFn != null) {
          dataSource.data.footerFn(row, data, start, end, display)
        }
      }
    },
    order: custSorts,
    dom: custDom,
    autoWidth: false
  });
  dataSource.table = table

  table.on('preXhr', () => {
    console.log("fetching...")
    // App.show();
  })
  table.on('draw', () => {
    $(".jsv" + dataSource.makeid.id).closest("tr").each((i, v) => {
      var j = dataSource.columns.filter((v, i) => {
        return v.showJson == true;
      })

      j.forEach((xx, xi) => {
        $($(v).find(".jsv" + dataSource.makeid.id)[xi]).jsonViewer(table.data()[i][xx.data], {
          collapsed: true
        });
      })

    })


    $(".table tbody tr").each((i, v) => {
      setTimeout(() => {
        $(v).removeClass("d-none")
      }, (10 * i) + 1)
    })

  })
  table.on('xhr', () => {
    // App.hide()
    console.log("fetched")
  })



  var delete_idx =
    window.phoenixModels.findIndex((v, i) => {
      return v.tableSelector == "#subSubTable"
    })
  if (delete_idx != -1) {
    window.phoenixModels.splice(delete_idx, 1)
  }

  var check =
    window.phoenixModels.filter((v, i) => {
      return (v.moduleName == dataSource.moduleName && v.tableSelector == dataSource.tableSelector)

      // return (v.moduleName == dataSource.moduleName)
    })

  if (check.length == 0) {
    window.phoenixModels.push(dataSource)
  } else {
    console.log("the dt already exist, consider reinsert?")


    var delete_idx =
      window.phoenixModels.findIndex((v, i) => {
        return (v.moduleName == dataSource.moduleName && v.tableSelector == dataSource.tableSelector)
      })
    if (delete_idx != -1) {
      window.phoenixModels.splice(delete_idx, 1)
      window.phoenixModels.push(dataSource)
    }
  }

  return table;
}

function populateGridView(dataSource) {
  var xcard = dataSource.xcard
  $(dataSource.tableSelector).closest(".dataTables_wrapper").find(".grid_view").html("<div></div>")

  var alis = []
  dataSource.table.data().length
  for (i = 0, j = dataSource.table.data().length; i < j; i++) {
    dataSource.table.data()[i].index = i
    alis.push(dataSource.table.data()[i])
  }

  var i, j, chunk = 12;
  var temparray = [];
  for (i = 0, j = alis.length; i < j; i += chunk) {
    temparray.push(alis.slice(i, i + chunk))
  }
  temparray.forEach((row, i) => {

    var parentDiv = document.createElement("div")
    parentDiv.setAttribute("class", "row g-2 gd")

    row.forEach((pv, pi) => {
      var data = pv

      var div = document.createElement("div")
      div.setAttribute("class", "col-12 col-lg-3 xc")
      var card = document.createElement("div")
      card.setAttribute("id", data.id)
      div.data = pv
      div.data.dataSource = dataSource

      card.setAttribute("aria-index", data.index)

      div.appendChild(card)

      // cards.push(div)
      parentDiv.appendChild(div)
    })

    // console.log(cards)
    $(dataSource.tableSelector).closest(".dataTables_wrapper").find(".grid_view").append(parentDiv)
    // here can start do the formating

  })
  setTimeout(() => {
    $(dataSource.tableSelector).closest(".table-responsive").find(" .gd").each((i, v) => {
      var id = $(v).attr("aria-index")
      appendRowDtButtons(dataSource, id)
    })
  }, 200)

}

function populateTableData(dataSourcee, length, onCompleteFn) {
  getTableData(dataSourcee, length, onCompleteFn)
}


function getTableData(dataSourcee, length, onCompleteFn) {
  var len = 100;
  if (length != null) {
    len = length;
  }
  var keys = Object.keys(dataSourcee.data);
  var xparams = [];
  $(keys).each((i, k) => {
    xparams.push("&" + k + "=" + dataSourcee.data[k]);
  });
  $.ajax({
    async: false,
    url: "/api/" + dataSourcee.link + "?foo=bar" + xparams.join(""),
    data: {
      draw: "1",
      order: {
        0: {
          column: "0",
          dir: "desc"
        }
      },
      columns: {
        0: {
          data: "id"
        }
      },
      length: len,
      start: 0
    }
  }).done(function(j) {
    $(j.data).each((i, dtdata) => {
      var added = $(dataSourcee.allData).filter(function(i, v) {
        return v.id == dtdata.id;
      });
      if (added.length == 0) {
        dataSourcee.allData.push(dtdata);
      }
    });

    if (onCompleteFn != null) {
      onCompleteFn()
    }

  });
}

function appendRowDtButtons(dataSource, index) {


  $(dataSource.buttons).each((i, params) => {
    if (params.buttonType != null) {
      if (params.buttonType == "grouped") {
        console.log("creating grouped...button...")
        params.fnParams.dataSource = dataSource;
        params.fnParams.aParams = dataSource.data;
        var buttonz = new groupedFormButton(
          params.name,
          params.color,
          params.buttonList,
          params.fnParams
        );
        $(dataSource.tableSelector).closest(".table-responsive").find(".card-footer[aria-index='" + index + "'").append(buttonz);

      } else {
        params.fnParams.dataSource = dataSource;
        params.fnParams.aParams = dataSource.data;
        var buttonz = new formButton({
            iconName: params.iconName,
            color: params.color,
            name: params.name
          },
          params.fnParams,
          params.onClickFunction);


        $(dataSource.tableSelector).closest(".table-responsive").find(".card-footer[aria-index='" + index + "'").append(buttonz);


        // $("td:eq(" + lastCol + ")", row).append(buttonz);
      }
    } else {

      params.fnParams.dataSource = dataSource;
      params.fnParams.aParams = dataSource.data;
      var buttonz = new formButton({
          iconName: params.iconName,
          color: params.color,
          name: params.name,
          tooltipText: params.tooltipText
        },
        params.fnParams,
        params.onClickFunction);


      $(dataSource.tableSelector).closest(".table-responsive").find(".gd[aria-index='" + index + "'").append(buttonz);


      // params.fnParams.dataSource = dataSource;
      // params.fnParams.aParams = dataSource.data;
      // var buttonz = new formButton({
      //         iconName: params.iconName,
      //         color: params.color,
      //         name: params.name
      //     },
      //     params.fnParams,
      //     params.onClickFunction
      // );
      // $("td:eq(" + lastCol + ")", row).append(buttonz);
    }
  });

}

function appendDtButtons(table_selector, parent_container_selector, data) {
  // $(table_selector).closest(parent_container_selector).find(".module_buttons").html(`
  //     <button type="submit" onclick="window.reinit();" class="btn btn-fill btn-round btn-primary" data-href="" data-module="" data-ref=""><i class="fa fa-redo"></i></button>
  //     <button type="submit" class="btn btn-fill btn-round btn-primary" onclick="form_new('` + table_selector + `')" data-href="" data-module="" data-ref=""><i class="fa fa-plus"></i></button>
  //     `)

  $(table_selector).closest(parent_container_selector).find(".module_buttons").html(`
                <button type="submit" onclick="toggleView('` + table_selector + `')" class="btn btn-fill btn-round btn-primary" data-href="" data-module="" data-ref="">
                <i class="fa fa-th-large"></i></button>
                <button type="submit" onclick="App.Functions.reinit()" class="btn btn-fill btn-round btn-primary" data-href="" data-module="" data-ref="">
                <i class="fa fa-redo"></i></button>
                <button type="submit" class="btn btn-fill btn-round btn-primary"  data-href="" data-module="add_new" data-ref=""><i class="fa fa-plus"></i></button>
                `);


  var nbutton = $(table_selector).closest(parent_container_selector).find(".module_buttons button[data-module='add_new']");
  try {
    nbutton[0].onclick = function() {
      window.currentSelector = table_selector;
      console.log("sub sub table data")
      console.log(data)
      form_new(table_selector, data)
    }

  } catch (e) {

  }


}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function childGroupedFormButton(name, onClickFunction, fnParams) {
  var button = document.createElement("a")
  button.setAttribute("class", "dropdown-item")
  button.setAttribute("href", "javascript:void(0);")
  button.innerHTML = name
  if (onClickFunction != null) {
    // console.log(fnParams)
    try {
      button.id = fnParams.dtdata.id;
    } catch (e) {
      // console.log("dont hav id in fnParams");
    }
    button.onclick = function() {
      fnParams.index = parseInt($($(button).closest("tr")).attr("aria-index"));
      // console.log("fnparam index")
      // console.log(fnParams.index)
      if (fnParams.index > -1) {} else {
        fnParams.index = parseInt($($(button).closest(".card-footer")).attr("aria-index"));
      }
      // console.log($($(button).closest(".card-footer")).attr("aria-index"))
      // console.log(fnParams.index)
      // console.log($(button).closest(".card-footer"))
      fnParams.row = $(button).closest("tr");
      onClickFunction(fnParams);
    };
  }

  return button
}

function groupedFormButton(name, color, button_list, fnParams) {

  var ref = makeid(6)
  var div = document.createElement("div")
  div.setAttribute("class", "btn-group")
  div.setAttribute("role", "group")
  div.setAttribute("aria-label", "Button group with nested dropdown")
  div.setAttribute("style", "margin-left: 10px;")

  var button = document.createElement("button")
  button.setAttribute("type", "button")
  button.setAttribute("class", "manage btn btn-sm btn-" + color)
  button.innerHTML = name
  div.append(button)

  var div2 = document.createElement("div")
  div2.setAttribute("class", "btn-group")
  div2.setAttribute("role", "group")
  var button2 = document.createElement("button")
  button2.setAttribute("id", ref)
  button2.setAttribute("type", "button")
  button2.setAttribute("class", "btn btn-sm btn-" + color + " dropdown-toggle")
  button2.setAttribute("data-bs-toggle", "dropdown")
  button2.setAttribute("aria-haspopup", "true")
  button2.setAttribute("aria-expanded", "false")
  div2.append(button2)
  var div3 = document.createElement("div")
  div3.setAttribute("class", "dropdown-menu")
  div3.setAttribute("aria-labelledby", ref)
  $(button_list).each((i, v) => {
    if (v.fnParams != null) {

      v.fnParams.dataSource = fnParams.dataSource
    } else {
      v.fnParams = fnParams
    }
    var child = new childGroupedFormButton(v.name, v.onClickFunction, v.fnParams)

    div3.append(child)
  })
  div2.append(div3)
  div.append(div2)
  return div;

}

function formButton(options, fnParams, onClickFunction) {
  var default_options = {
    iconName: "fa fa-check",
    color: "btn btn-primary",
    onClickFunction: null,
    fnParams: null,
    name: "Submit",
    tooltipText: "Hints"
  }
  var keys =
    Object.keys(default_options)
  keys.forEach((v, i) => {
    this[v] = default_options[v]
  })
  keys.forEach((v, i) => {
    if (options[v] != null) {
      this[v] = options[v]
    }
  })

  var button = document.createElement("button");
  button.setAttribute("type", "button");
  button.setAttribute("data-bs-toggle", "tooltip");
  button.setAttribute("data-bs-original-title", "");
  button.setAttribute("data-bs-placement", "left");

  button.setAttribute("class", "btn btn-" + this.color + " btn-sm");
  button.setAttribute("title", this.tooltipText);
  var i = document.createElement("i");
  i.className = this.iconName;

  button.append(i);
  var nameSpan = document.createElement("span");
  if (this.name == undefined) {
    this.name = "";
  } else {
    nameSpan.setAttribute("style", "padding: 0 10px;");
  }
  nameSpan.innerHTML = this.name;
  button.append(nameSpan);
  var div = document.createElement("div");
  div.className = "ripple-container";
  button.append(div);
  button.style = "margin-left: 10px;";
  if (onClickFunction != null) {
    try {
      button.id = this.fnParams.dtdata.id;
    } catch (e) {
      console.log("dont hav id in fnParams");
    }
    button.onclick = function() {

      // this maybe from a grid view, that uses div
      if ($($(button).closest("tr")).attr("aria-index") == null) {
        fnParams.index = parseInt($($(button).closest("div")).attr("aria-index"))
      } else {
        fnParams.index = parseInt($($(button).closest("tr")).attr("aria-index"))
      }

      // parseInt($($(button).closest("tr")).attr("aria-index"));
      fnParams.row = $(button).closest("tr");
      fnParams.tbody = $(button).closest("tbody");
      onClickFunction(fnParams);
    };
  }
  return button;
}

function toggleView(id) {
  var dataSource =
    window.phoenixModels.filter((v, i) => {
      return v.tableSelector == id
    })[0]
  $(dataSource.tableSelector).closest(".dataTables_wrapper").find(".grid_view").toggleClass("d-none")
  $(dataSource.tableSelector).closest(".dataTables_wrapper").find(".list_view").toggleClass("d-none")



}



function formNavClick(index) {
  $(".form_nav .nav-link").removeClass("active")
  $(".nav-link[aria-index='" + index + "']").toggleClass("active")
  $(".fp").addClass("d-none")
  $("#panel_" + index).toggleClass("d-none")
}

function toggleSubContent(html_content, row) {
  var dom = $("#subcontent")[0]
  console.log(html_content)
  if (dom.offsetParent == null && html_content != null) {
    $("#content").toggle()
    $("#subcontent").toggle()
    $("#subcontent").html(html_content)
  } else {
    // where sub dt is visible and content is not null
    if (dom.offsetParent != null && html_content != null) {
      // row.child(html_content).show();
    } else {
      $("#content").show()
      $("#subcontent").html('')
      $("#subcontent").hide()
      console.log("populating sub contents....")
      try {
        window.currentAssoc.table.draw()

      } catch (e) {


      }
      if ($("#content button[data-module='back']").length == 0) {
        $("#content .module_buttons").append(`

                <button type="submit" onclick="init()" class="btn btn-fill btn-round btn-success" data-href="" data-module="back" data-ref="">
                  <i class="fa fa-chevron-left"></i></button>`)
      }


    }

  }

}

function showAssocDataManyToMany(params) {
  var dt = params.dataSource;
  var table = dt.table;
  var r = table.row(params.row);
  var preferedSelector = "subTable";
  if (params["hyperSelector"] != null) {
    preferedSelector = params["hyperSelector"];
  }

  function call() {
    var jj =
      `
        <table class="table" id="` +
      preferedSelector +
      `" style="width:100%">
          <thead>
          </thead>
          <tbody>
          </tbody>
        </table>

            `;
    r.child(jj).show();
    var map = {};
    var primary_key;
    $(params.extraParams).each((i, xparam) => {
      primary_key = table.data()[params.index][xparam["parent"]];
      if (xparam["value"] != null) {
        map[xparam["child"]] = xparam["value"];
      } else {
        map[xparam["child"]] = table.data()[params.index][xparam["parent"]];
      }
    });
    // params.subSource.data = map;
    // params.subSource.table = populateTable(params.subSource);


    var subSource = new phoenixModel({
      moduleName: params.subSource,
      link: params.subSource,
      customCols: [],
      columns: params.columns

    })
    subSource.allData = []
    subSource.tableSelector = "#" + preferedSelector
    console.log(map)
    console.log(params.subSource)
    subSource.data = map;
    var label_keys =
      Object.keys(subSource.data)
    label_keys.forEach((v, i) => {

      subSource.customCols.push({
        label: v,
        hidden: true,
        data: subSource.data[v]
      })
    })
    subSource.data.preloads = params.preloads
    subSource.table = populateTable(subSource);

  }
  if (r.child.isShown()) {
    if (gParent == this) {
      r.child.hide();
    } else {
      gParent = this;
      call();
    }
  } else {
    table.rows().every(function(rowIdx, tableLoop, rowLoop) {
      this.child.hide();
    });
    gParent = this;
    call();
  }
}

function showAssocData(params) {
  function callFn(params) {
    var preferedSelector = "subTable";
    if (params["hyperSelector"] != null) {
      preferedSelector = params["hyperSelector"];
    }
    var title = params.title;
    if (title == null) {
      title = "Subtable";
    }
    var xcard = params.xcard;
    if (xcard == null) {

      xcard = `
                <div class="card-body" style="min-height: 12vh;">
                
                    <span class="text-muted" x-html="data.name"></span>
                </div>

            `

    }
    var dt = params.dataSource;
    var table = dt.table;
    if (table.data()[params.index].name != null) {
      title = table.data()[params.index].name + " " + title
    }
    var r = table.row(params.row);
    var jj =
      `<div class="subcontainer" >
        <div class="d-flex justify-content-between items-align-center">
        <p class="pl-4 lead" style="border-left: solid 4px var(--primary);">` +

      title +
      `</p>
        <div>
          <div class="btn btn-sm btn-primary" onclick="toggleSubContent()">Back</div>
        </div>
      </div>

        <table class="table" id="` +
      preferedSelector +
      `" style="width:100%">
          <thead>
          </thead>
          <tbody>
          </tbody>
          <tfoot>
          </tfoot>
        </table>
        </div>

      `;
    toggleSubContent(jj, r);
    // r.child(jj).show()
    var map = {};
    var primary_key;
    $(params.extraParams).each((i, xparam) => {
      primary_key = table.data()[params.index][xparam["parent"]];
      if (xparam["value"] != null) {
        map[xparam["child"]] = xparam["value"];
      } else {
        map[xparam["child"]] = table.data()[params.index][xparam["parent"]];
      }
    });
    if (params.footerFn != null) {
      map["footerFn"] = params.footerFn;
    }
    window.currentAssoc = window.phoenixModels.filter((v, i) => {
      return v.moduleName == params.subSource
    })[0]
    var subSource = new phoenixModel(window.currentAssoc)
    subSource.allData = []
    subSource.tableSelector = "#" + preferedSelector
    console.log(map)
    console.log(params.subSource)
    subSource.data = { ...map,
      ...subSource.data
    };
    var label_keys =
      Object.keys(subSource.data)
    label_keys.forEach((v, i) => {

      subSource.customCols.push({
        label: v,
        hidden: true,
        data: subSource.data[v]
      })
    })
    subSource.table = populateTable(subSource);
    if (params.customSorts != null) {
      subSource.table.order(params.customSorts).draw();
    }
    if (params.onDrawFunction != null) {
      subSource.table.on("draw", function() {
        params.onDrawFunction(primary_key);
      });
    } else {

    }
    appendDtButtons("#" + preferedSelector, "#subcontent", subSource.data)
    populateGridView(subSource, xcard)

  }
  openSubData(params, callFn)
}

function newAssocData(params) {
  var dataSource = params.dataSource;
  var mod = params["mod"];
  var link = params["link"];
  var href = params["href"];
  var data = params["data"];
  var postFn = params["postFn"]
  var customCols = params["customCols"];
  if (dataSource != null) {
    var curData = dataSource.table.data()[params.index];
    if (params.targets != null) {
      $(params.targets).each((i, target) => {
        if (target.prefix != null) {
          data[target.child] = target.prefix + curData[target.parent];
        } else {
          data[target.child] = curData[target.parent];
        }
      });
    }
  }

  var form =
    `
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">
          <form style="margin-top: 0px;" class="with_mod" id="` +
    link +
    `"  module="` +
    mod +
    `">
          </form>
          </div>
        </div>
      </div>
    </div>`;
  $("#myModal")
    .find(".modal-title")
    .html("Create  New " + mod);
  $("#myModal").find(".modal-body").html(form);
  createForm(data, dataSource.table, customCols, postFn);
  $("#myModal").modal('show');
}


function openSubData(params, callFn) {
  var title = params.title;
  if (title == null) {
    title = "Subtable";
  }
  var dt = params.dataSource;
  var table = $(dt.tableSelector).DataTable();
  var r = table.row(params.row);
  dt.currentData = table.data()[params.index];

  function call() {
    callFn(params)
  }
  if (r.child.isShown()) {
    if (title == window.prev_title) {
      r.child.hide();
    } else {
      setTimeout(function() {
        call();
      }, 100)
    }
    window.prev_title = title;
  } else {
    table.rows().every(function(rowIdx, tableLoop, rowLoop) {
      this.child.hide();
    });
    setTimeout(function() {
      call();
    }, 100)
  }
}

function editData(params) {
  console.log("editing data...")
  var dt = params.dataSource;
  window.currentSelector = dt.tableSelector
  var table = dt.table;
  var r = table.row(params.row);
  var rowData = table.data()[params.index]


  var preferedLink;
  if (params.link != null) {
    preferedLink = params.link;
  } else {
    preferedLink = dt.link;
  }
  var default_selector = "#mySubModal"
  if (dt.data.modalSelector != null) {
    default_selector = dt.data.modalSelector
  }

  function call() {
    console.log(rowData)
    var jj =
      `<form style="margin-top: 0px;" class="with_mod" id="` +
      preferedLink +
      `"  module="` +
      dt.moduleName +
      `"></form>`;
    // r.child(jj).show();

    $(default_selector)
      .find(".modal-title")
      .html("Edit " + dt.moduleName);
    $(default_selector).find(".modal-body").html(jj);
    $(default_selector).modal('show');


    createForm(rowData, table, params.customCols, params.postFn);
    if (params.drawFn != null) {
      params.drawFn()
    }
  }

  if (r.child.isShown()) {
    r.child.hide();
    call();
  } else {
    table.rows().every(function(rowIdx, tableLoop, rowLoop) {
      this.child.hide();
    });
    gParent = this;
    call();
  }
}

function deleteAssoc(params) {
  var dataSource = params.dataSource;

  var data = params["data"];
  if (dataSource != null) {
    var curData = dataSource.table.data()[params.index];
    if (params.targets != null) {
      $(params.targets).each((i, target) => {
        if (target.prefix != null) {
          data[target.child] = target.prefix + curData[target.parent];
        } else {
          data[target.child] = curData[target.parent];
        }
      });
    }
  }

  console.log(data);

  $.ajax({
    url: "/api/webhook",
    method: "DELETE",
    data: {
      scope: "assoc_data",
      id: curData.id,
      parent: data.parent
    }
  }).done(function() {
    App.notify("deleted!", {
      type: "info"
    });
    dataSource.table.draw(false);
  });
}

function deleteData(params) {
  var dataSource = params.dataSource;
  var table = $(dataSource.tableSelector).DataTable();
  var dtdata = table.data()[params.index];
  $("#myModal").find(".modal-title").html("Confirm delete this data?");
  var confirm_button = formButton("fa fa-check", "outline-danger");
  console.log(dataSource);
  confirm_button.onclick = function() {
    $.ajax({
      url: "/api/" + dataSource.link + "/" + dtdata.id,
      dataType: "json",
      headers: {
        "Authorization": "Basic " + window.userToken
      },
      method: "DELETE",
      data: dataSource.data
    }).done(function(j) {
      $("#myModal").modal("hide");

      App.notify("Deleted!", {
        type: "info"
      });
      dataSource.table.draw(false);
    }).fail(function(e) {
      console.log(e.responseJSON.status);


      App.notify("Not Added! reason: " + e.responseJSON.status, {
        type: "warning"
      });


    });;
  };
  var center = document.createElement("center");
  center.append(confirm_button);
  $("#myModal").find(".modal-body").html(center);
  $("#myModal").modal('show');
}


function repopulateFormInput(data, formSelector) {
  var inputs = $(formSelector).find("[name]");
  $(inputs).each(function(i, v) {
    var name = $(v).attr("aria-label");
    var defaultVal = $(v).attr("has-default")
    var hidden_value = $(v).attr("aria-value");

    if ($(v).prop("localName") == "select") {
      console.log("selct def val")
      if (data[name] == null) {

      } else {
        $(v).val(data[name]);

      }
    } else if (defaultVal == "true" && data[name] == null) {


    } else if (hidden_value != null) {
      $(v).val(hidden_value);
    } else if ($(v).hasClass("code")) {
      try {
        //  var ht = data[name]
        // $(v).val(html_beautify(ht));

        $(v).val(data[name]);
        var hid_inpt = document.createElement("input");
        hid_inpt.setAttribute("type", "hidden");
        hid_inpt.setAttribute("name", $(v).attr("name"));
        $(v).after(hid_inpt);
        var select_input = `
          <div class="p-4">
          <label>Choose an image</label>
            <select id="imageURL">              
              
            </select>
          </div>`


        $("#editor1").val(data[name])
        $("#editor1").richText({
          // imageHTML: select_input
        })
        // whenever the add button is clicked, maybe pop up the modal to choose image instead?
        // $("")

      } catch (e) {
        console.log("failed editor")
        $(v).val(data[name]);
      }
    } else {
      if ($(v).attr("type") == "checkbox") {
        console.log("got data?")
        console.log(data[name])
        if ($(v).hasClass("many_2_many")) {
          var id = parseInt(v.name.split("][")[1].split("]")[0])

          try {
            var res = data[name].filter((v, i) => {
              return v.id == id
            })
            if (res.length > 0) {

              $(v).prop("checked", data[name]);
            }

          } catch (e) {
            $(v).prop("checked", false);

          }

        } else {

          $(v).prop("checked", data[name]);
        }
      } else {
        if (data != null) {
          console.log(name);
          console.log("name: " + name + ", data: " + data[name]);

          if (name.includes(".")) {

            try {

              var module_name = $(v).closest("form").attr("id")
              var assoc_val = name.split(".")
              if (assoc_val.length == 2) {

                $(v).val(data[assoc_val[0]][assoc_val[1]]);
                $(v).parent().append(`<input type='hidden' value="` + data[assoc_val[0]]['id'] + `" name="` + module_name + `[` + assoc_val[0] + `][id]"></input>`)

              }
              if (assoc_val.length == 3) {

                $(v).val(data[assoc_val[0]][assoc_val[1]][assoc_val[2]]);
                $(v).parent().append(`<input type='hidden' value="` + data[assoc_val[0]]['id'] + `" name="` + module_name + `[` + assoc_val[0] + `][id]"></input>`)

              }
              if (assoc_val.length == 1) {

                $(v).val(data[assoc_val[0]]);
                $(v).parent().append(`<input type='hidden' value="` + data[assoc_val[0]]['id'] + `" name="` + module_name + `[` + assoc_val[0] + `][id]"></input>`)

              }
            } catch (e) {
              $(v).val(data[name]);
            }

          } else {
            try {
              $(v).val(data[name]);
            } catch (e) {
              console.log("missing dom?")

            }
          }

        } else {
          console.log("name: " + name + ", data: ?");
        }
      }
    }



  });


}

function generateInputs(j, v, object, qv) {
  var input2 = "";
  var label_title = v.charAt(0).toUpperCase() + v.slice(1)

  if (typeof qv == "object") {
    if (qv.alt_name != null) {
      label_title = qv.alt_name
    }

  }


  switch (j[v]) {
    case "string":
      // code block

      input2 = `<div class="">
                      <div class="pb-1 pt-1 ps-1 text-start">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control">
                        </div>
                      </div>
                    </div>`
      break;
    case "boolean":
      // code block

      input2 = `<div class="row d-flex align-items-center ">
                      <label class="offset-1 col-sm-3 col-form-label text-end label-checkbox">` + label_title + `</label>
                      <div class="col-sm-6 checkbox-radios">
                        <div class="form-check">
                          <label class="form-check-label">
                            <input class="form-check-input" type="checkbox" aria-label="` + v + `" name="` + object + `[` + v + `]" value=""> This ` + v + `
                            <span class="form-check-sign">
                              <span class="check"></span>
                            </span>
                          </label>
                        </div>
                        
                      </div>
                    </div>`
      break;
    case "integer":
      // code block
      if (v.includes("id")) {
        input2 =
          '<input  aria-label="' +
          v +
          '" name="' +
          object +
          "[" +
          v +
          ']" type="hidden" cl"a"ss="form-control" value="0">';
      } else {

        input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="number" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control">
                        </div>
                      </div>
                    </div>`
      }
      break;
    case "date":

      input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group">
                          <input type="date" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control datepicker">
                        </div>
                      </div>
                    </div>`
      break;
    case "naive_datetime":

      input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control datetimepicker">
                        </div>
                      </div>
                    </div>`
      break;
    default:
      // code block
      if (v == "id" || v.includes("_id")) {
        input2 =
          '<input  aria-label="' +
          v +
          '" name="' +
          object +
          "[" +
          v +
          ']" type="hidden" class="form-control" value="0">';
      } else {

        input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <input type="text" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control">
                        </div>
                      </div>
                    </div>`
      }
  }
  if (typeof qv == "object") {
    var selections = [];

    if (qv.selection != null) {
      var live_search = ""
      var multiple = ""
      if (qv.live_search != null) {
        if (qv.live_search) {
          live_search = `data-live-search="true"`
        }
      }
      if (qv.multiple != null) {
        if (qv.multiple) {
          multiple = "multiple"
        }
      }
      $(qv.selection).each(function(index, selection) {
        var name;

        var vall;
        if (typeof selection == "object") {
          name = selection.name;
          vall = selection.id;
        } else {
          name = selection;
          vall = selection;
        }
        selections.push('<option value="' + vall + '">' + name + "</option>");
      });



      input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group">
                         <select ` + multiple + ` ` + live_search + `aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control selectpicker" >
                         ` + selections.join("") + `
                         </select>
                        </div>
                      </div>
                    </div>`
    }


    if (qv.binary) {


      input2 = `<div class="">
                      <div class="ps-1 py-2">` + label_title + `</div>
                      <div class="col-sm-12">
                        <div class="form-group bmd-form-group">
                          <textarea rows=12 cols=12 aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control"></textarea>
                        </div>
                      </div>
                    </div>`
    }
    if (qv.code) {

      input2 = `<div class="row">
                      <label class="col-sm-3 col-form-label text-end">` + label_title + `</label>
                      <div class="col-sm-9">
                        <div class="form-group bmd-form-group">
                          <textarea rows=4 cols=12 aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control code"></textarea>
                        </div>
                      </div>
                    </div>`
    }
    if (qv.checkboxes != null) {
      var checkboxes = [];

      qv.checkboxes.sort(function(b, a) {
        return b.name.localeCompare(a.name);
      })

      $(qv.checkboxes).each((i, checkbox) => {
        var c =
          `
                    <div class="form-check">
                      <label class="text-capitalize">
                        <input aria-label="` + v + `" class="form-check-input many_2_many" type="checkbox" name="` +
          object +
          "[" +
          v +
          `][` +
          checkbox.id +
          `]"  value="true"> ` +
          checkbox.name +
          `
                        <span class="form-check-sign">
                          <span class="check"></span>
                        </span>
                      </label>
                    </div>`;
        checkboxes.push(c);
      });

      input2 = `<div class="row">
                      <label class="col-sm-2 col-form-label text-end">` + label_title + `</label>
                      <div class="col-sm-8">
                        <div class="form-group bmd-form-group">
                          ` + checkboxes.join("") + `
                        </div>
                      </div>
                    </div>`
    }
    if (qv.upload) {


      input2 = `<div class="">
                      <div class="pb-1 pt-1 ps-1 text-start">` + label_title + `</div>
                      <div class="col-sm-12">
                        
                        <img style="display: none;" id="myImg" src="#" alt="your image" width=300>
                          <input style="padding-top: 2vh;" type="file" aria-label="` + v + `" name="` + object + `[` + v + `]" class="">
                        
                      </div>
                    </div>`
    }
    if (qv.editor) {
      input2 =
        '<div class="col-sm-12"><div class="form-group bmd-form-group"><label class="bmd-label-floating">' +
        label_title +
        '</label><textarea id="editor1" rows=10 cols=12 aria-label="' +
        v +
        '" name="' +
        object +
        "[" +
        v +
        ']" class="code form-control" ></textarea></div></div>';

      // var editor = new EditorJS('editorjs');
    }
    if (qv.date) {

      input2 = `<div class="row">
                      <label class="offset-1 col-sm-3 col-form-label text-end">` + label_title + `</label>
                      <div class="col-sm-6">
                        <div class="form-group bmd-form-group">
                          <input type="datetime-local" aria-label="` + v + `" name="` + object + `[` + v + `]" class="form-control datepicker">
                        </div>
                      </div>
                    </div>`
    }
    if (qv.alias) {

      var assoc_val = v.split(".")
      if (qv.onClickFn != null) {

        if (assoc_val.length == 2) {

          input2 = `<div class="">
                        <div class="pb-1 pt-1 ps-1 text-start">` + label_title + `</div>
                        <div class="row gx-0">
                          <div class="col-10">
                            <div class="form-group bmd-form-group">
                              <input type="text" aria-label="` + v + `" name="` + object + `[` + assoc_val[0] + `][` + assoc_val[1] + `]" class="form-control">
                            </div>
                          </div>
                          <div class="col-2">
                            <div class="btn btn-outline-primary" onclick="` + qv.onClickFn + `">Change</div>
                          </div>
                        </div>
                      </div>`
        }

        if (assoc_val.length == 3) {

          input2 = `<div class="">
                        <div class="pb-1 pt-1 ps-1 text-start">` + label_title + `</div>
                        <div class="row">
                          <div class="col-10">
                            <div class="form-group bmd-form-group">
                              <input type="text" aria-label="` + v + `" name="` + object + `[` + assoc_val[0] + `][` + assoc_val[1] + `][` + assoc_val[2] + `]" class="form-control">
                            </div>
                          </div>
                          <div class="col-2">
                            <div class="btn btn-outline-primary" onclick="` + qv.onClickFn + `">Change</div>
                          </div>
                        </div>
                      </div>`
        }

      } else {
        if (assoc_val.length == 2) {

          input2 = `<div class="">
                              <div class="pb-1 pt-1 ps-1 text-start">` + label_title + `</div>
                              <div class="row">
                                <div class="col-12">
                                  <div class="form-group bmd-form-group">
                                    <input type="text" aria-label="` + v + `" name="` + object + `[` + assoc_val[0] + `][` + assoc_val[1] + `]" class="form-control">
                                  </div>
                                </div>
                               
                              </div>
                            </div>`

          if (qv.binary) {

            input2 = `<div class="">
                                        <div class="ps-1 py-2">` + label_title + `</div>
                                        <div class="col-sm-12">
                                          <div class="form-group bmd-form-group">
                                            <textarea rows=4 cols=12 aria-label="` + v + `"  name="` + object + `[` + assoc_val[0] + `][` + assoc_val[1] + `]" class="form-control"></textarea>
                                          </div>
                                        </div>
                                      </div>`



          }

          if (qv.editor) {

            input2 = `<div class="">
                                        <div class="ps-1 py-2">` + label_title + `</div>
                                        <div class="col-sm-12">
                                          <div class="form-group bmd-form-group">
                                            <textarea id="editor1" rows=10 cols=12 aria-label="` + v + `"  name="` + object + `[` + assoc_val[0] + `][` + assoc_val[1] + `]" class="form-control"></textarea>
                                          </div>
                                        </div>
                                      </div>`



          }
        }
        if (assoc_val.length == 3) {

          input2 = `<div class="">
                              <div class="pb-1 pt-1 ps-1 text-start">` + label_title + `</div>
                              <div class="row">
                                <div class="col-12">
                                  <div class="form-group bmd-form-group">
                                    <input type="text" aria-label="` + v + `" name="` + object + `[` + assoc_val[0] + `][` + assoc_val[1] + `][` + assoc_val[2] + `]" class="form-control">
                                  </div>
                                </div>
                               
                              </div>
                            </div>`
        }
      }


    }
    if (qv.hidden) {

      if (v.includes(".")) {

        var assoc_val = v.split(".")
        input2 =
          '<input type="hidden" aria-label="' +
          v +
          '" name="' +
          object +
          '[' + assoc_val[0] + '][' + assoc_val[1] + ']"  aria-value="' + qv.data + '">';
      } else {

        input2 =
          '<input type="hidden" aria-label="' +
          v +
          '" name="' +
          object +
          "[" +
          v +
          ']"  aria-value="' + qv.data + '">';
      }

    }

  }

  console.log("i2")
  // var dom2 = new DOMParser().parseFromString(input2, "text/xml")
  var div = document.createElement("div")
  div.innerHTML = input2


  if (qv.default != null) {

    default_val = qv.default()

    if ($(div).find("input").length > 0) {

      $(div).find("input").val(default_val)
      $(div).find("input").attr("has-default", "true")
      $(div).find("input").attr("value", default_val)
    } else if ($(div).find("select").length > 0) {

      $(div).find("select").val(default_val)
      $(div).find("select").attr("has-default", "true")
      $(div).find("select").attr("value", default_val)
    }

  }

  return div.firstChild;
}

function appendInputs(xv, cols, j, object) {
  $(cols).each(function(qi, qv) {
    var v;
    if (typeof qv == "object") {
      v = qv.label;
    } else {
      v = qv;
    }
    var input = "";
    var input2 = "";
    input2 = generateInputs(j, v, object, qv);
    if (typeof qv == "object") {
      var selections = [];
      if (qv.binary) {} else {
        if (qv.sub != null) {
          // here insert a smaller form inputs?
          // run the form submission first,
          // get the primary id and stuff it back to parent form
          var subModule = qv.sub.moduleName;
          var subLink = qv.sub.link;
          var customCols = qv.sub.customCols;
          $.ajax({
            url: "/api/webhook?scope=gen_inputs",
            dataType: "json",
            async: false,
            data: {
              module: subModule
            }
          }).done(function(j) {
            var cols = Object.keys(j);

            if (customCols != null) {
              if (customCols.length > 0) {

                cols = customCols;
              }
            }

            var combo = [];
            $(cols).each((i, col) => {
              var v;
              if (typeof col == "object") {
                v = col.label;
              } else {
                v = col;
              }
              var input3 = "";
              input3 = generateInputs(j, v, subLink, col);
              combo.push(input3);
            });

            input2 =
              input2 +
              `<div class="row subform" style="display: none;"><div class="offset-1 col-sm-9">` +
              combo.join("") +
              `</div></div>`;
          });
        }
      }
    }

    // input into a different panels?
    $(xv).append(input2);
  });

}

function form_new(id, data, customCols, postFn, onDrawFn) {
  console.log()

  var dataSource =
    window.phoenixModels.filter((v, i) => {
      return v.tableSelector == id
    })[0]

  var default_selector = "#mySubModal"
  if (data.modalSelector != null) {
    default_selector = data.modalSelector
  }

  if (customCols == null) {
    customCols = dataSource.customCols
  }
  var form =
    `<form style="" class="with_mod" id="` +
    dataSource.link +
    `"  module="` +
    dataSource.moduleName +
    `">
      </form>`;
  $(default_selector)
    .find(".modal-title")
    .html("Create  New " + dataSource.moduleName);
  $(default_selector).find(".modal-body").html(form);
  createForm({
    ...{
      id: 0
    },
    ...data
  }, dataSource.table, customCols, postFn, onDrawFn);

  $(default_selector).modal('show');

}

function createForm(dtdata, table, customCols, postFn, onDrawFn) {
  $(".with_mod").each(function(i, xv) {
    // var xv = form ;
    $(xv).html("");

    var mod = $(this).attr("module");
    var object = $(this).attr("id");

    $.ajax({
      async: false,
      url: "/api/webhook?scope=gen_inputs",
      dataType: "json",
      data: {
        module: mod
      }
    }).done(function(j) {
      var cols = Object.keys(j);


      if (customCols != null) {
        // convert this to a ... tab panels...

        if (typeof customCols[0] === 'object' && customCols[0] !== null) {
          console.log("has multi list," + customCols.length)
          // insert the tabs? 

          $(xv).html(`
                            <div class="row">
                              <div class="col-sm-3">
                                <ul class="nav nav-pills flex-column form_nav">
                                 
                               
                                </ul>

                              </div>
                              <div class="col-sm-9 p-lg-1 p-4" id="form_panels">

                              </div>
                            </div>

                        `)



          $(customCols).each((i, v) => {
            if (i == 0) {
              $(".form_nav").append(`
                                   <li class="nav-item">
                                      <a class="active nav-link" aria-index="` + i + `" href="javascript:void(0);" onclick="formNavClick('` + i + `')" >` + v.name + `</a>
                                    </li>
                          `)
            } else {

              $(".form_nav").append(`
                                   <li class="nav-item">
                                      <a class="nav-link" aria-index="` + i + `" href="javascript:void(0);" onclick="formNavClick('` + i + `')" >` + v.name + `</a>
                                    </li>
                          `)
            }
            // insert the panels
            if (i == 0) {
              $("#form_panels").append(`<div class="fp " id="panel_` + i + `"></div>`)

            } else {
              $("#form_panels").append(`<div class="fp d-none"  id="panel_` + i + `"></div>`)

            }
            $("#panel_" + i).append(`<div class="col-lg-12"><b class="pb-4">` + v.name + `</b></div>`);
            appendInputs($("#panel_" + i), v.list, j, object)
          })



        } else {
          cols = customCols;
          appendInputs(xv, cols, j, object)
          console.log(cols.join("','"));
        }


      } else {
        cols =
          cols.filter((v, i) => {
            return v != "inserted_at"
          })
        cols =
          cols.filter((v, i) => {
            return v != "updated_at"
          })
        appendInputs(xv, cols, j, object)
        console.log(cols.join("','"));
      }

      $($(xv).find("select")).on("change", function() {
        var val = $(this).val();
        var sf = $($(this).closest(".subform")).length;
        console.log(val);
        if (sf == 0) {

          if (val == 0) {
            $(".subform").fadeIn();
          } else {
            $(".subform").hide();
          }
        }
      });

      function btnSubm() {
        if ($("#myModal .modal-dialog").hasClass("modal-lg")) {
          $("#myModal .modal-dialog").toggleClass("modal-lg")
        }
        var formData = new FormData($(xv).closest("form")[0]);
        $(xv)
          .find("input[type='checkbox']")
          .each((zi, zv) => {
            $(zv).val($(zv).prop("checked"));

            formData.append(
              object + "[" + $(zv).attr("aria-label") + "]",
              $(zv).prop("checked")
            );
          });

        $(xv)
          .find("textarea")
          .each((zi, zv) => {
            formData.append(
              object + "[" + $(zv).attr("aria-label") + "]",
              $(zv).val()
            );
          });
        // console.log(formData);
        var failed_inputs =
          $(".with_mod").closest("form").find("input").filter((i, v) => {
            return v.checkValidity() == false
          })
        console.log(failed_inputs);
        if (failed_inputs.length > 0) {
          failed_inputs.map((v, i) => {
            App.notify("This input: " + $(i).attr("placeholder") + " is not valid!", {
              type: "danger"
            });

          })

        } else {

          $.ajax({
              url: "/api/" + object,
              dataType: "json",
              headers: {
                "Authorization": "Basic " + window.userToken
              },
              method: "POST",
              enctype: "multipart/form-data",
              processData: false, // tell jQuery not to process the data
              contentType: false,
              data: formData
            })
            .done(function(j) {
              App.notify("Added!", {
                type: "success"
              });
              $("#mySubModal").modal("hide");
              if (table != null) {
                console.log("redrawing table.. ");
                console.log(object)
                console.log(window.currentSelector)
                var tarMods = window.phoenixModels.filter((v, i) => {
                  return v.moduleName == object && v.tableSelector == window.currentSelector
                })

                tarMods.forEach((tarMod, i) => {

                  try {
                    tarMod.reload();
                  } catch (e) {
                    console.log("cant find the table")

                  }
                })

                // toggleSubContent();
                // App.Functions.reinit();

              }
              if (postFn != null) {
                if (dtdata.xparams != null) {

                  postFn(dtdata.xparams);
                } else {

                  postFn(j);
                }
              }


            })
            .fail(function(e) {
              console.log(e.responseJSON.status);
              App.notify("Not Added! reason: " + e.responseJSON.status, {
                type: "danger"
              });
            });
        }

      };
      var row = document.createElement("div")
      row.className = "row"

      var col_lg_12 = document.createElement("div")
      col_lg_12.className = "pt-4 col-lg-12"
      row.append(col_lg_12)

      try {
        var ck_editor = CKEDITOR.replace("editor1", {
          height: 500,
          on: {
            instanceReady: function() {
              this.document.appendStyleSheet('/css/bootstrap.min.css');
            }
          }
        });
        CKEDITOR.config.allowedContent = true;
        CKEDITOR.config.removeButtons = 'Image';
        CKEDITOR.instances.editor1.on("change", function() {
          var data = CKEDITOR.instances.editor1.getData();
          $(CKEDITOR.instances.editor1.element["$"]).val(data);
        });

        ck_editor.addCommand("mySimpleCommand", {
          exec: function(edt) {
            try {
              callStoredMedia(CKEDITOR.instances.editor1);
            } catch (e) {

            }
          }
        });
        ck_editor.ui.addButton('SuperButton', {
          label: "Click me",
          command: 'mySimpleCommand',
          toolbar: 'insert',
          icon: '/images/image-solid.svg'
        });

      } catch (e) {
        console.log("no editor");
      }

      var submit_btn = formButton(

        {
          iconName: "check",
          color: "primary subm",
          name: "Submit"

        }, {},
        btnSubm

      );
      col_lg_12.append(submit_btn)

      if ($(xv).find(".subm").length == 0) {
        $(xv).append(row);
      }


      repopulateFormInput(dtdata, xv);


    });
    // return xv;
  });

  if (onDrawFn != null) {

    onDrawFn()
  }
}

function submitFormData(selector, url, postFn, xparams) {

  if ($("#myModal .modal-dialog").hasClass("modal-lg")) {
    $("#myModal .modal-dialog").toggleClass("modal-lg")
  }
  var object = url
  var xv = $(selector)[0]
  var formData = new FormData(xv);

  $(xv)
    .find("input[type='checkbox']")
    .each((zi, zv) => {
      $(zv).val($(zv).prop("checked"));

      formData.append(
        object + "[" + $(zv).attr("aria-label") + "]",
        $(zv).prop("checked")
      );
    });
  console.log(formData);
  $.ajax({
      url: "/api/" + object,
      dataType: "json",
      method: "POST",
      headers: {
        "Authorization": "Basic " + window.userToken
      },
      enctype: "multipart/form-data",
      processData: false, // tell jQuery not to process the data
      contentType: false,
      data: formData,
      xhr: function() {
        $("#helper").fadeIn();
        //Get XmlHttpRequest object
        var xhr = $.ajaxSettings.xhr();
        //Set onprogress event handler
        xhr.upload.onprogress = function(data) {
          var perc = Math.round((data.loaded / data.total) * 100);
          $("#helper").text(perc + "%");
        };
        return xhr;
      },
      error: function(e) {
        console.error("Error has occurred while uploading the media file.");

      }
    })
    .done(function(j) {
      App.notify("Added!", {
        type: "success"
      });

      try {
        App.Functions.reinit();
        $("#myModal").modal('hide')
      } catch (e) {

      }

      try {
        if (postFn != null) {
          postFn(xparams);
        }
      } catch (e) {

      }

      App.hide()
    })
    .fail(function(e) {
      console.log(e.responseJSON.status);
      App.notify("Not Added! reason: " + e.responseJSON.status, {
        type: "danger"
      });
    });
};

function calColor(done, total) {
  var color
  if (color == null) {
    var s = (done / total) * 100
    if (s == 100) {
      color = "bg-primary"
    }
    if (s < 100) {
      color = "bg-success"
    }
    if (s < 80) {
      color = "bg-warning"
    }
    if (s < 25) {
      color = "bg-danger"
    }
  }
  return color
}

function calWidth(done, total) {
  var perc = (done / total * 100).toFixed(0)
  return 'width: ' + perc + '%;'
}

function growthComparison(cur, prev) {
  var diff = (((cur - prev) / prev) * 100).toFixed(2)
  var df = (cur - prev)
  if (cur < prev) {

    var text = `<span class="d-flex justify-content-start align-items-center" 
 style="color: red"><i class="pe-2 fa fa-2x fa-caret-down"></i>` + df + ` <small class="ps-2">` + diff + `%</small></span>`
  } else {

    var text = `<span class="d-flex justify-content-start align-items-center" 
 style="color: var(--bs-success)"><i class="pe-2 fa fa-2x fa-caret-up"></i>` + df + ` <small class="ps-2">` + diff + `%</small></span>`
  }
  return text

}

function avatarCard(name, subtitle, img_url) {

  return `
                    <div class="d-flex justify-content-start align-items-center">
                      <img height="32px" width="32px" class="rounded-circle" src="` + img_url + `" alt="Circle image">
                      <div class="d-flex flex-column  ps-3">
                        <span class="text-muted">` + name + `</span><div>` + subtitle + `</div>
                      </div>
                    </div>
                    `
}



let Dashboard = {

  Widget: {
    tableProgress(dom, options) {
      var default_options = {
        title: 'Upcoming fulfillments<br> <small>This month for Damien</small>',
        icon_map: "fa fa-wallet fa-2x",
        style: "basic",
        color: 'bg-secondary',
        headers: [],
        dt: [{
          title: 'Cendol4u Pte Ltd',
          done: 3,
          total: 20
        }, {
          title: 'XY2C Trading',
          done: 5,
          total: 20
        }, {
          title: 'FG5C Trading',
          done: 8,
          total: 20
        }, {
          title: 'Thunder Vanilla Sdn Bhd',
          done: 11,
          total: 20
        }, {
          title: 'ED3C Trading',
          done: 12,
          total: 20
        }, {
          title: 'AB2C Trading',
          done: 18,
          total: 20
        }]
      }
      var keys =
        Object.keys(default_options)

      keys.forEach((v, i) => {
        this[v] = default_options[v]
      })
      keys.forEach((v, i) => {
        if (options[v] != null) {
          this[v] = options[v]
        }
      })
      var inner_html

      if (this.style == "status") {
        inner_html = `
                    <div x-bind:class="color" class="card-header text-white">
                      <div x-html="title"></div>
                      <i style="position: absolute;right: 2vw;top: 2vh;opacity: 0.3;" x-bind:class="icon_map" class=""></i>
                    </div>
                    <div class="card-body">

                      <table class="table">
                          <tr>
                        <template x-for="head in headers">
                            <th>
                                <div x-html="head"></div>
                            </th>
                            
                        </template>                   
                          </tr>
                        <template x-for="row in rows">
                          <tr style="vertical-align: top;">
                            <td>
                                <div x-html="row.first"></div>
                            </td>
                            <td>
                                <div x-html="row.second"></div>
                            </td>
                            <td>
                                <div x-html="row.third"></div>
                            </td>
                          </tr>
                        </template>
                      </table>
                    </div>

              `
      }
      if (this.style == "basic") {
        inner_html = `
                    <div x-bind:class="color" class="card-header text-white">
                      <div x-html="title"></div>
                      <i style="position: absolute;right: 2vw;top: 2vh;opacity: 0.3;" x-bind:class="icon_map" class=""></i>
                    </div>
                    <div class="card-body">

                      <table class="table">
                        <tr>
                          <th>Company</th>
                          <th class="text-end">Fulfilled</th>
                          <th class="text-center">Actions</th>
                        </tr>
                        <template x-for="row in rows">
                          <tr >
                            <td>
                              <div>
                                <div x-text="row.title"></div>
                                <div class="progress" style="height: 4px;">
                                  <div class="progress-bar" x-bind:class="calColor(row.done, row.total)" role="progressbar" x-bind:style="calWidth(row.done, row.total)" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div class="d-flex justify-content-end align-items-end">
                                <div x-text="row.done"></div>
                                <small class="ps-2 text-muted "> /<span x-text="row.total"></span></small>
                              </div>
                            </td>
                            <td class="text-center">
                              <div class="btn btn-sm btn-outline-primary"><i class="fa fa-search"></i></div>
                            </td>
                          </tr>
                        </template>
                      </table>
                    </div>

              `
      }
      var html
      var html = `
                  <div class="card" x-data='{
                    icon_map: "` + this.icon_map + `",
                    title: "` + this.title + `",
                    color: "` + this.color + `", headers: ` + JSON.stringify(this.headers) + `,
                    
                    rows: ` + JSON.stringify(this.dt) + `
                    
                    }'>
                    ` + inner_html + `
                  </div>
                  `
      console.log(html)
      $(dom).html(html)
      // $(postFns).each((i, v) => {
      //     setTimeout(() => {
      //         v();
      //     }, 100)

      // })
    },
    progressBar(dom, options) {
      var style, target_name, done, total, postFns, prefix, suffix, icon_map, icon_size, color;

      var default_options = {
        target_name: "This month fulfillments",
        done: 5,
        total: 20,
        postFns: [],
        prefix: null,
        suffix: "more to go",
        icon_map: "fa fa-users fa-2x",
        icon_size: null,
        color: null,
        style: "basic"
      }
      default_options.pending = default_options.total - default_options.done
      options.pending = options.total - options.done

      var keys =
        Object.keys(default_options)

      keys.forEach((v, i) => {
        this[v] = default_options[v]
      })
      keys.forEach((v, i) => {
        if (options[v] != null) {
          this[v] = options[v]
        }
      })

      this.icon_map = this.icon_map == null ? "" : this.icon_map
      this.prefix = this.prefix == null ? "" : this.prefix
      this.suffix = this.suffix == null ? "more to go" : this.suffix

      if (this.color == null) {
        var s = (this.done / this.total) * 100
        if (s == 100) {
          this.color = "bg-primary"
        }
        if (s < 100) {
          this.color = "bg-success"
        }
        if (s < 80) {
          this.color = "bg-warning"
        }
        if (s < 25) {
          this.color = "bg-danger"
        }

      }

      var inner_content;

      if (this.style == "basic") {
        inner_content = `
              <div class="card-body">
                <div class="d-flex justify-content-start align-items-center pb-2  " >
                  <div class="text-xl pe-2 d-flex justify-content-start align-items-center" >
                      <small x-text="prefix"></small>
                      <div class="ps-1" x-text="pending"></div>
                  </div>
                  <div x-text="suffix">more to go</div>
                  
                </div>
                <div class="progress">
                  <div class="progress-bar bg-primary"  role="progressbar" 
                  x-bind:style="width" aria-valuemin="0" aria-valuemax="100"></div>
                  <div class="progress-bar " x-bind:class="color"  role="progressbar" 
                  x-bind:style="rem_width" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <div class="pt-2 d-flex justify-content-start text-muted"><div x-text="target_name"></div> 
                  <div class=" d-flex justify-content-start ps-2">
                    <div x-text="done"></div>/<div x-text="total"></div>
                  </div>
                </div>

                <i x-bind:class="icon" style="position: absolute;right: 1vw;color: #0001;top: 1vh;"></i>
              </div>

              `
      }

      if (this.style == "inverse") {
        inner_content = `
            <div class="card-body">
              <div class="pt-2 d-flex justify-content-start "><div x-text="target_name"></div> 
              </div>
              <div class="d-flex justify-content-start align-items-end pb-2  " >
                <div class="text-xl pe-2 d-flex justify-content-start align-items-center" >
                    <small x-text="prefix"></small>
                    <div class="ps-1" x-text="done"></div>
                </div>
                     <div class="d-flex justify-content-end pb-2 text-muted">
                      /<div x-text="total"></div>
                    </div>
              </div>
              <div class="progress"  style="height: 4px;">
                <div class="progress-bar" x-bind:class="color" role="progressbar" 
                x-bind:style="width" aria-valuemin="0" aria-valuemax="100"></div>
              
              </div>
              <div class="pt-2 d-flex justify-content-end text-muted">
               
              </div>

              <i x-bind:class="icon" style="position: absolute;right: 1vw;color: #0001;top: 1vh;"></i>
            </div>

              `
      }
      if (this.style == "thin") {
        inner_content = `
            <div class="card-body">
              <div class="d-flex justify-content-start align-items-center pb-2  " >
                <div class="text-xl pe-2 d-flex justify-content-start align-items-center" >
                    <small x-text="prefix"></small>
                    <div class="ps-1" x-text="pending"></div>
                </div>
                <div x-text="suffix">more to go</div>
                
              </div>
              <div class="progress"  style="height: 4px;">
                <div class="progress-bar" x-bind:class="color" role="progressbar" 
                x-bind:style="width" aria-valuemin="0" aria-valuemax="100"></div>
              
              </div>
              <div class="pt-2 d-flex justify-content-start text-muted"><div x-text="target_name"></div> 
                <div class=" d-flex justify-content-start ps-2">
                  <div x-text="done"></div>/<div x-text="total"></div>
                </div>
              </div>

              <i x-bind:class="icon" style="position: absolute;right: 1vw;color: #0001;top: 1vh;"></i>
            </div>
              `
      }


      var html =
        `
            <div class="card" x-data="
              { 
                icon: '` + this.icon_map + `',
                prefix: '` + this.prefix + `',
                suffix: '` + this.suffix + `',
                target_name: '` + this.target_name + `',
                color: '` + this.color + `',
                done: ` + this.done + `, 
                total: ` + this.total + `, 
                pending: ` + this.pending + `,
                rem_width: 'width:' + ((` + this.pending + `/` + this.total + `)*100).toFixed(0) + '%',
                width: 'width:' + ((` + this.done + `/` + this.total + `)*100).toFixed(0) + '%'
              }">
            ` + inner_content + `
            </div>
            `
      $(dom).html(html)
      $(postFns).each((i, v) => {
        setTimeout(() => {
          v();
        }, 100)

      })

    },
    sales(dom, options) {
      var style, title, decimal, cur, prev, postFns, prefix, suffix, icon_map;

      var default_options = {
        title: 'Total Sales <small>(MYR)</small>',
        cur: 200,
        decimal: false,
        prev: 100,
        postFns: [],
        prefix: "",
        suffix: "",
        icon_map: "fa fa-wallet fa-2x",
        style: "basic"
      }
      default_options.diff = (((default_options.cur - default_options.prev) / default_options.prev) * 100).toFixed(2)
      var keys =
        Object.keys(default_options)

      keys.forEach((v, i) => {
        this[v] = default_options[v]
      })
      keys.forEach((v, i) => {
        if (options[v] != null) {
          this[v] = options[v]
        }
      })
      options.diff = (((options.cur - options.prev) / options.prev) * 100).toFixed(2)
      var inner_html

      if (this.style == "basic") {
        inner_html = `
                <div class="card-body">
                  <div class="text-center text-muted" >` + this.title + `</div>
                  <div class="row">
                    <div class="col-sm-12 text-center d-flex align-items-center justify-content-around">
                      <div class="text-xl float" x-html="cur">0</div>

                    </div>
                    <div class="col-sm-10 offset-1 text-center pt-2 ">
                       
                     <div class="d-flex justify-content-around align-items-center text-muted">
                        <i x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' "
                            x-bind:class="cur_month < last_month ? 'fa fa-2x fa-caret-down' : 'fa fa-2x fa-caret-up' "></i>
                    
                        <div class="text-sm d-flex justify-content-around"  x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' ">
                          <div class="format_float pe-2" x-text="cur_month - last_month" ></div>
                          (<span x-text="diff">0</span>%)
                        </div>
                        <small class="ps-2">prev month</small>
                     </div>

                    </div>
                  </div>
                  </div>
              `
      }
      if (this.style == "Compact") {
        inner_html = `
              <div class="card-body">
                  <div class="row" ">
                    <div class="col-sm-12 text-start">
                      <div class="text-muted" >` + this.title + `</div>
                    </div>
                    <div class="col-sm-12 text-start d-flex align-items-center justify-content-start">
                      <div class="text-xl format_float" x-html="cur">0</div>
                    </div>
                    <div class="col-sm-10 text-center ">
                     <div class="d-flex justify-content-around align-items-center" >
                      <i x-bind:style=" cur_month < last_month ? 'color: red; ' : 'color: var(--bs-success); ' "
                            x-bind:class="cur_month < last_month ? 'fa fa-2x fa-caret-down' : 'fa fa-2x fa-caret-up' "></i>
                      <div class="text-sm format_float" x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' " x-text="cur_month - last_month">0 </div>
                      <small x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' "> 
                        <span  x-text="diff">0</span>%</small> 
                      <small class="text-muted" x-html="suffix">prev month</small>
                     </div>
                    </div>
                  </div>
                  </div>
              `
      }
      if (this.style == "Block") {
        inner_html = `
                <div class="card-header bg-primary text-white" >` + this.title + `</div>  
                <div class="card-body">
                  <div class="row" ">
                    <div class="col-sm-12 d-flex justify-content-around align-items-center">
                      <div class="text-lg" x-html="cur">0</div>
                      <div x-bind:style=" cur_month < last_month ? 'color: red;' : 'color: var(--bs-success);' " class="d-flex align-items-center justify-content-between">
                          <i x-bind:class="cur_month < last_month ? 'fa fa-2x fa-caret-down' : 'fa fa-2x fa-caret-up' "></i>
                          <div class="text-sm format_float" x-text="cur_month - last_month">0 </div> 
                          (<span  x-text="diff">0</span>%)
                      </div>
                      <small class="text-muted">prev month</small>
                    
                    </div>
                  </div>
                </div>
              `
      }
      var html = `

              <div class="card"  x-data="{
               
                  cur_month: ` + this.cur + `,
                  last_month: ` + this.prev + `,
                  suffix: '` + this.suffix + `',
                  diff: ` + this.diff + `,
                  icon_map: '` + this.icon_map + `',
                  cur: '` + (this.decimal ? currencyFormat(parseFloat(this.cur)) : this.cur) + `'
                }">
                ` + inner_html + `
               
             </div>

            `
      $(dom).append(html)
      $(this.postFns).each((i, v) => {
        setTimeout(() => {
          v(".float");
        }, 100)

      })

    },
    statusCard(dom, options) {
      var icon_map, title, quantity, style, color, button

      var default_options = {
        title: 'Total Sales <small>(MYR)</small>',
        quantity: 0,
        icon_map: "fa fa-wallet fa-2x",
        style: "basic",
        color: 'bg-success',
        btn: '<div class="btn btn-success">New</div>'
      }
      var keys =
        Object.keys(default_options)

      keys.forEach((v, i) => {
        this[v] = default_options[v]
      })
      keys.forEach((v, i) => {
        if (options[v] != null) {
          this[v] = options[v]
        }
      })
      var html

      if (this.style == "tile") {
        html = `

                    <div class="card rounded-lg" x-data="{
                    icon_map: '` + this.icon_map + `',
                 
                    quantity: ` + this.quantity + `,
                    color: '` + this.color + `',


                    }">
                      <div x-bind:class="color" class="card-body text-center " 
                      style="border-top-left-radius: 0.3rem;border-top-right-radius: 0.3rem;">
                        <i style="opacity: 0.7" x-bind:class="icon_map" class="text-white fa-4x"></i>
                      </div>
                      <div class="card-body text-center">
                        <div class="text-xl" x-text="quantity">13</div>
                        <div class="text-lg text-muted" >` + this.title + `</div>
                        
                      </div>
                      <div class="card-body text-center" >
                      ` + this.btn + `
                      </div>
                    </div>
                    `
      }
      if (this.style == "compact") {
        html = `
                  <div class="card mb-3" x-data="{
                    icon_map: '` + this.icon_map + `',

                    quantity: ` + this.quantity + `,
                    color: '` + this.color + `'

                  }">
                    <div class="card-body py-0 px-0">
                      <div class="row g-0">
                        <div x-bind:class="color" class="col-4 d-flex justify-content-center align-items-center" 
                        style="border-top-left-radius: 0.3rem;border-bottom-left-radius: 0.3rem;">
                          <i x-bind:class="icon_map" class="text-white" style="opacity: 0.4"></i>
                        </div>
                        <div class="col-8 ">
                          <div class="p-2 text-center">
                       
                            <div class="d-flex justify-content-between align-items-center gap-4 px-4">    
                             <div class="text-lg" x-text="quantity">121</div><div class="text-muted" >` + this.title + `</div></div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                  `
      }
      if (this.style == "horizontal") {
        html = `
                  <div class="card mb-3" x-data="{
                    icon_map: '` + this.icon_map + `',

                    quantity: ` + this.quantity + `,
                    color: '` + this.color + `'

                  }">
                    <div class="card-body py-0 px-0">
                      <div class="row g-0">
                        <div x-bind:class="color" class="col-4 d-flex justify-content-center align-items-center" 
                        style="border-top-left-radius: 0.3rem;border-bottom-left-radius: 0.3rem;">
                          <i x-bind:class="icon_map" class="text-white" style="opacity: 0.4"></i>
                        </div>
                        <div class="col-8 ">
                          <div class="p-2 text-center">
                            <div class="text-lg" x-text="quantity">121</div>
                            <div class="text-muted" >` + this.title + `</div>
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                  `
      }

      if (this.style == "basic") {

        html = `

                <div class="card" x-data="{
                  icon_map: '` + this.icon_map + `',
       
                  quantity: ` + this.quantity + `,
                }">
                  <div class="card-body text-center">
                    <i x-bind:class="icon_map" class="pb-3 text-primary" style="opacity: 0.4"></i>
                    <div class="text-lg text-muted" >` + this.title + `</div>
                    <div class="text-xl" x-html="quantity">0</div>
                    
                  </div>
                </div>

              `
      }
      $(dom).html(html)



    }
  }
}

function currencyFormat(num) {
  if (num == null) {

    return "0.00"
  } else {
    return num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }
}

function formatDate() {

  $(".format_float").each((i, v) => {
    var prefix = ""
    if ($(v).html().split(" ").includes("DR")) {
      prefix = "DR"
    }
    if ($(v).html().split(" ").includes("CR")) {
      prefix = "CR"
    }
    var content = $(v).html().replace("-", "")

    if (parseFloat(content) > 0) {
      var span = `<span class="text-end" >` + currencyFormat(parseFloat(content)) + ` ` + prefix + `</span>`
      $(v).html(span)

    } else if (parseFloat(content) == 0) {
      $(v).html("0.00")
    } else {
      $(v).html(content)
    }

  })

  $(".format_date").each((i, v) => {
    // console.log() 
    var d = $(v).html().replace(" ", "");

    if (Date.parse(d) > 0) {
      var date = new Date(d)
      var day;
      if (date.getDate().toString().length > 1) {
        day = date.getDate()
      } else {
        day = "0" + date.getDate()
      }
      var month;
      var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      if ((date.getMonth() + 1).toString().length > 1) {
        month = (date.getMonth() + 1)
      } else {
        month = "0" + (date.getMonth() + 1)
      }
      month = MONTH_NAMES[date.getMonth()]

      $(v).html("<b>" + day + "-" + month + "-" + date.getFullYear() + "</b>")
      $(v).html("<b>" + month + " " + day + " " + date.getFullYear() + "</b>")
    } else {
      $(v).html(d)

    }

  })
  $(".format_datetime").each((i, v) => {


    var offset = 0
    if ($(v).attr("aria-offset") != null) {

      offset = parseInt($(v).attr("aria-offset"))
    }

    // console.log() 
    var d = $(v).html();
    if (Date.parse(d.split(" ")[0]) > 0) {
      var date = new Date(d.split(" ")[0])
      var day;
      if (date.getDate().toString().length > 1) {
        day = date.getDate()
      } else {
        day = "0" + date.getDate()
      }
      var month;
      if ((date.getMonth() + 1).toString().length > 1) {
        month = (date.getMonth() + 1)
      } else {
        month = "0" + (date.getMonth() + 1)
      }

      $(v).html("<b>" + day + "-" + month + "-" + date.getFullYear() + " " + d.split(" ")[1] + "</b>")
    }

  })

  $(".is_posted").each((i, v) => {

    // console.log() 
    var d = $(v).html();
    if (d == "true") {
      $(v).html(`
                <i class="text-success fa fa-check"></i>
                `)
    }

    if (d == "false") {
      $(v).html(`
                <i class="text-danger fa fa-exclamation-circle"></i>
                `)
    }


  })
}

function dataFormatter(dtdata, v) {
  var input2 = null;
  var formatType = ['formatFloat', 'showBoolean', 'formatDateTime', 'showImg', 'showChild']
  var selectedKey = -1
  var keys = Object.keys(v)
  formatType.forEach((f, ii) => {
    if (keys.indexOf(f) > 0) {
      selectedKey = ii
    }
  })

  console.log(formatType[selectedKey])
  switch (formatType[selectedKey]) {
    case 'formatFloat':
      input2 = currencyFormat(dtdata[v.data]);
      break;
    case 'showImg':
      try {
        console.log(("simmg"))
        input2 = `
        <div style="background-size: cover !important; background-image: url('` + dtdata[v.data] + `') !important; 
        height: 80px;width: 80px" class="rounded-circle text-center 
        bg-primary d-flex align-items-center justify-content-center text-white">
        </div>`

      } catch (e) {
        console.log(e)

      }
      break;
    case 'showChild':
      if (v.xdata.showImg) {
        try {
          input2 = dtdata[v.xdata.child][v.xdata.data]
          console.log("attemp to show img...")
          if (dtdata[v.xdata.child][0] != null) {
            input2 = `
              <div style="background-size: cover !important; background-image: url('` + dtdata[v.xdata.child][0][v.xdata.data] + `') !important; 
              height: 80px;width: 80px" class="rounded-circle text-center 
              bg-primary d-flex align-items-center justify-content-center text-white">
              </div>`
          }
        } catch (e) {

        }
      }
      if (v.xdata.formatFloat) {
        input2 = currencyFormat(dtdata[v.xdata.child][v.xdata.data])
      }

      break;
    case 'showBoolean':
      try {
        var ic;
        if (dtdata[v.data] == true) {
          ic = `<i class="text-success fa fa-check"></i>`
        } else {
          ic = `<i class="text-danger fa fa-times"></i>`
        }
        input2 = ic
      } catch (e) {

      }
      break;

    case 'formatDateTime':
      // code block
      var str = dtdata[v.data]
      var dt = new Date(str)
      dt.setTime(dt.getTime() + (8 * 60 * 60 * 1000));
      var edate = dt.toGMTString().split(",")[1].split(" ").splice(0, 4).join(" ")
      var etime = dt.toLocaleTimeString()
      input2 = `<span class="text-muted fw-bold">` + edate + `</span>

              <small class="fw-bold text-primary">
                  ` + etime + `          
              </small>
                 `
      break;
    default:
      input2 = dtdata[v.data]
  }


  if (input2 == null) {
    input2 = dtdata[v.data]
  }

  return input2

}

let ColumnFormater = {
  datetime(row, dtdata, dataSource) {
    var dCols =
      dataSource.columns.filter((v, i) => {
        return v.formatDateTime == true;
      })
    dCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data;
        })
      try {
        var str = dtdata[v.data]
        var dt = new Date(str)
        dt.setTime(dt.getTime() + (8 * 60 * 60 * 1000));
        var edate = dt.toGMTString().split(",")[1].split(" ").splice(0, 4).join(" ")
        var etime = dt.toLocaleTimeString()


        $("td:eq(" + index + ")", row).html(
          `<span class="text-muted fw-bold">` + edate + `</span><br>

          <small class="fw-bold text-primary">
              ` + etime + `          
          </small>
             `);
        // }
      } catch (e) {

      }
    })
  },
  img(row, dtdata, dataSource) {
    var showBooleanCols =
      dataSource.columns.filter((v, i) => {
        return v.showImg == true;
      })
    showBooleanCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data;
        })
      try {
        var ic;
        ic = `

        <div style="background-size: cover; background-image: url('` + dtdata[v.data] + `'); 
        height: 80px;width: 80px" class="rounded-circle text-center 
        bg-primary d-flex align-items-center justify-content-center text-white">
        </div>`
        $("td:eq(" + index + ")", row).html(ic);
      } catch (e) {

      }
    })
  },
  progress(row, dtdata, dataSource) {

    var showProgressCols =
      dataSource.columns.filter((v, i) => {
        return v.showProgress == true;
      })
    showProgressCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data;
        })
      try {
        var content = dtdata[v.data];
        var progressList = v.progress;
        // populate the list
        var pg = []
        var perc = 1 / progressList.length * 100
        var check_index = progressList.findIndex((v, i) => {
          return v == content
        });
        progressList.forEach((progress, pi) => {
          if (check_index >= pi) {
            var bar = `<div class="progress-bar bg-warning " role="progressbar" style="width: ` + perc + `%;" ></div>
              `
          } else {
            var bar = `<div class="progress-bar " role="progressbar" style="width: ` + perc + `%;" ></div>
              `
          }
          pg.push(bar)
        })

        p = `
          <small>` + content + `</small>
          <div class="progress gap-1">
          ` + pg.join("") + `
          </div>
        `
        $("td:eq(" + index + ")", row).html(p);
      } catch (e) {

      }
    })

  },
  subtitle(row, dtdata, dataSource) {
    var showSubtitleCols =
      dataSource.columns.filter((v, i) => {
        return v.showSubtitle == true;
      })
    showSubtitleCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data;
        })

      var subindex = 0
      subindex =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.subtitle;
        })
      try {
        var content = dtdata[v.data];
        var sub = dtdata[v.subtitle]

        if (dataSource.columns[index].showChild) {
          content = dtdata[v.xdata.child][v.xdata.data]
        }

        if (dataSource.columns[index].formatFloat) {
          content = currencyFormat(content)
        }
        if (dataSource.columns[subindex].formatFloat) {
          sub = currencyFormat(sub)
        }
        if (dataSource.columns[subindex].showBoolean) {
          if (dtdata[v.subtitle] == true) {
            sub = `<i class="text-success fa fa-check"></i>`
          } else {
            sub = `<i class="text-danger fa fa-times"></i>`
          }
        }

        $("td:eq(" + index + ")", row).html(`<span class="pe-2">` + content + `</span><small class="text-muted text-truncate" style="max-width: 24vw;display: block;">` + sub + `</small>`);
      } catch (e) {

      }
    })
  },
  bool(row, dtdata, dataSource) {
    var showBooleanCols =
      dataSource.columns.filter((v, i) => {
        return v.showBoolean == true;
      })
    showBooleanCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data;
        })
      try {
        var ic;
        if (dtdata[v.data] == true) {
          ic = `<i class="text-success fa fa-check"></i>`
        } else {
          ic = `<i class="text-danger fa fa-times"></i>`
        }
        $("td:eq(" + index + ")", row).html(ic);
      } catch (e) {

      }
    })
  },
  json(row, dtdata, dataSource) {
    var showJsonCols =
      dataSource.columns.filter((v, i) => {
        return v.showJson == true;
      })
    showJsonCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data;
        })
      try {
        $("td:eq(" + index + ")", row).html(`<div aria-data='` + `` + `' class="jsv` + dataSource.makeid.id + `" id="` + v.data + `` + dtdata.id + `"></div>`);
      } catch (e) {

      }
    })
  },
  child(row, dtdata, dataSource) {
    var showChildCols =
      dataSource.columns.filter((v, i) => {
        return v.showChild == true;
      })
    showChildCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data && x.xdata == v.xdata;
        })
      try {
        $("td:eq(" + index + ")", row).html(dtdata[v.xdata.child][v.xdata.data]);

      } catch (e) {

        if (v.xdata.showImg) {
          try {
            console.log("attemp to show img...")
            if (dtdata[v.xdata.child][0] != null) {
              var ic;
              ic = `
            <div style="background-size: cover; background-image: url('` + dtdata[v.xdata.child][0][v.xdata.data] + `'); 
            height: 80px;width: 80px" class="rounded-circle text-center 
            bg-primary d-flex align-items-center justify-content-center text-white">
            </div>`
              $("td:eq(" + index + ")", row).html(ic);
            }
          } catch (e) {

          }
        }
      }
    })

  },

  float(row, dtdata, dataSource) {
    var formatFloatCols =
      dataSource.columns.filter((v, i) => {
        return v.formatFloat == true;
      })
    formatFloatCols.forEach((v, i) => {
      var index = 0
      index =
        dataSource.columns.findIndex((x, i) => {
          return x.data == v.data;
        })
      try {
        $("td:eq(" + index + ")", row).html(currencyFormat(dtdata[v.data]));
      } catch (e) {

      }
    })

  }
}

function enlargeModal() {
  if ($("#mySubModal .modal-dialog").hasClass("modal-xl")) {
    // $("#mySubModal .modal-dialog").toggleClass("modal-xl")
  } else {
    $("#mySubModal .modal-dialog").toggleClass("modal-xl")
  }

  if ($("#myModal .modal-dialog").hasClass("modal-xl")) {

  } else {
    $("#myModal .modal-dialog").toggleClass("modal-xl")
  }
}

function regularModal() {
  resetModal()
  if ($("#mySubModal .modal-dialog").hasClass("modal-lg")) {
    // $("#mySubModal .modal-dialog").toggleClass("modal-xl")
  } else {
    $("#mySubModal .modal-dialog").toggleClass("modal-lg")
  }

  if ($("#myModal .modal-dialog").hasClass("modal-lg")) {

  } else {
    $("#myModal .modal-dialog").toggleClass("modal-lg")
  }
}

function resetModal() {
  if ($("#mySubModal .modal-dialog").hasClass("modal-xl")) {
    $("#mySubModal .modal-dialog").removeClass("modal-xl")
  }
  if ($("#mySubModal .modal-dialog").hasClass("modal-lg")) {
    $("#mySubModal .modal-dialog").removeClass("modal-lg")
  }

}
resetModal()