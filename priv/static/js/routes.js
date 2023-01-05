$(document).ready(() => {
  // read the current url params
  var routes = [
    { fn: "dashboardInit();", title: "Home" },
    { fn: "searchAll();", title: "Search" },
    { fn: "listBlogs()", title: "Blogs" },
    
    // { fn: "supplierDebitNotes();", title: "All Supplier Invoices" }


  ]
  var title = getUrlParameter("get")

  if (title != null) {

    var res = routes.filter((v, i) => {
      return v.title == title;
    })[0]
    if (res != null) {
      setCurrentPage(res.fn, title)
    } else {
      App.notify("cant find route")
      // setCurrentPage(routes[0].fn, routes[0].title)
    }
  }
})