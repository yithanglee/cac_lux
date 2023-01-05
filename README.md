# Cac

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix


# Create admin user
`Cac.Settings.User.changeset(%Cac.Settings.User{}, %{username: "admin2", crypted_password: :crypto.hash(:sha512, "123") |> Base.encode16() |> String.downcase() }) |> Cac.Repo.insert`

then goto http://localhost:8501/admin/login
