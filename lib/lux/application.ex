defmodule Lux.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Lux.Repo,
      # Start the Telemetry supervisor
      LuxWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Lux.PubSub},
      # Start the Endpoint (http/https)
      LuxWeb.Endpoint
      # Start a worker by calling: Lux.Worker.start_link(arg)
      # {Lux.Worker, arg}
    ]

    path = File.cwd!() <> "/media"

    if File.exists?(path) == false do
      File.mkdir(File.cwd!() <> "/media")
    end

    File.rm_rf("./priv/static/images/uploads")
    File.ln_s("#{File.cwd!()}/media/", "./priv/static/images/uploads")
    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Lux.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    LuxWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
