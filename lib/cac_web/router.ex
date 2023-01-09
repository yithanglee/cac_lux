defmodule CacWeb.Router do
  use CacWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]

    plug(Cac.ApiAuthorization)
  end

  pipeline :blank do
    plug(:put_layout, {CacWeb.LayoutView, :blank})
    # plug(Materialize.Authorization)
  end

  pipeline :frontend do
    plug(:put_layout, {CacWeb.LayoutView, :frontend})
    plug(Cac.Authorization)
  end

  scope "/member", CacWeb do
    pipe_through :browser
    get("/dashboard", PageController, :member_dashboard)
    get("/login", LoginController, :index)
    get("/reset", LoginController, :reset)
    post("/reset", LoginController, :set_new_member_password)
    post("/authenticate", LoginController, :authenticate)
    get("/logout", LoginController, :logout)
  end

  scope "/author", CacWeb do
    pipe_through :browser
    get("/dashboard", PageController, :author_dashboard)
    get("/login", LoginController, :index)
    get("/register", LoginController, :register)
    post("/register", LoginController, :create)
    post("/authenticate", LoginController, :authenticate)
    get("/logout", LoginController, :logout)
    get "/*path", PageController, :dashboard
  end

  scope "/admin", CacWeb do
    pipe_through :browser
    get("/dashboard", PageController, :dashboard)
    get("/login", LoginController, :index)
    get("/register", LoginController, :register)
    post("/register", LoginController, :create)
    post("/authenticate", LoginController, :authenticate)
    get("/logout", LoginController, :logout)
    get "/*path", PageController, :dashboard
  end

  scope "/api", CacWeb do
    pipe_through :api
    # get("/webhook/fb", ApiController, :fb_webhook)
    # post("/webhook/fb", ApiController, :fb_webhook_post)
    get("/webhook", ApiController, :webhook)
    post("/webhook", ApiController, :webhook_post)
    delete("/webhook", ApiController, :webhook_delete)
    get("/:model", ApiController, :datatable)
    post("/:model", ApiController, :form_submission)
    delete("/:model/:id", ApiController, :delete_data)
  end

  # Other scopes may use custom stacks.
  # scope "/api", CacWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: CacWeb.Telemetry
    end
  end

  scope "/", CacWeb do
    pipe_through [:browser, :blank]
    get "/show_page", PageController, :show_page
  end

  scope "/", CacWeb do
    pipe_through [:browser, :frontend]
    get "/fb_login", PageController, :fb_login
    get "/fb_relogin", PageController, :fb_relogin
    get "/fb_callback", PageController, :fb_callback
    get "/blogs/:id/:title", PageController, :index
    get "/*path", PageController, :index
  end
end
