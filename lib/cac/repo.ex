defmodule Cac.Repo do
  use Ecto.Repo,
    otp_app: :cac,
    adapter: Ecto.Adapters.Postgres
end
