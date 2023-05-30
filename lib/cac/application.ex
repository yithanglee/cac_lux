defmodule Cac.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Cac.Repo,
      # Start the Telemetry supervisor
      CacWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Cac.PubSub},
      # Start the Endpoint (http/https)
      CacWeb.Endpoint
      # This will setup the Registry.ExGram
      # ExGram,
      # {Cac.Bot, [method: :polling, token: Application.get_env(:cac, :telegram)[:token]]}
      # Start a worker by calling: Cac.Worker.start_link(arg)
      # {Cac.Worker, arg}
    ]

    path = File.cwd!() <> "/media"

    if File.exists?(path) == false do
      File.mkdir(File.cwd!() <> "/media")
    end

    File.rm_rf("./priv/static/images/uploads")
    File.rm_rf("./priv/static/wp-content/uploads")
    File.ln_s("#{File.cwd!()}/media/", "./priv/static/images/uploads")

    File.rm_rf("./priv/static/wp-content/uploads")
    File.ln_s("#{File.cwd!()}/media/", "./priv/static/wp-content/uploads")

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Cac.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    CacWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
