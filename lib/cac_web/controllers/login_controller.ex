defmodule CacWeb.LoginController do
  use CacWeb, :controller
  import Ecto.Query
  alias Cac.{Settings, Repo}

  def index(conn, params) do
    render(conn, "login.html", layout: {CacWeb.LayoutView, "login.html"})
  end

  def register(conn, params) do
    render(conn, "register.html", layout: {CacWeb.LayoutView, "login.html"})
  end

  def create(conn, params) do
    crypted_password =
      :crypto.hash(:sha512, params["password"]) |> Base.encode16() |> String.downcase()

    case Settings.create_user(
           params
           |> Map.put("crypted_password", crypted_password)
           |> Map.delete("password")
         ) do
      {:ok, user} ->
        conn
        |> put_session(:current_user, BluePotion.s_to_map(user))
        |> put_flash(:info, "Welcome!")
        |> redirect(to: "/admin/dashboard")

      {:error, cg} ->
        conn
        |> put_flash(:error, "Please try again!")
        |> redirect(to: "/admin/register")
    end
  end

  def set_new_member_password(conn, %{"token" => token, "password" => password}) do
    crypted_password = :crypto.hash(:sha512, password) |> Base.encode16() |> String.downcase()

    map = Cac.Settings.decode_member_token(token)
    m = Cac.Settings.get_member!(map.id)

    {:ok, m} = Cac.Settings.update_member(m, %{crypted_password: crypted_password})

    conn
    |> put_session(:current_user, BluePotion.s_to_map(m))
    |> put_flash(:info, "Welcome!")
    |> redirect(to: "/member/dashboard")
  end

  # need a reset password page... with proper token to initiate
  def reset(conn, %{"token" => token} = params) do
    # token = ""
    map = Cac.Settings.decode_member_token(token)

    Cac.Settings.get_member!(map.id)
    |> IO.inspect()

    render(conn, "reset.html", token: token, layout: {CacWeb.LayoutView, "login.html"})
  end

  def reset(conn, params) do
    conn
    |> put_flash(:info, "Token expired!")
    |> redirect(to: "/member/login")
  end

  def authenticate(conn, params) do
    {res, scope} =
      if "member" in conn.path_info do
        {check_password(params, :member), :member}
      else
        {check_password(params), :user}
      end
      |> IO.inspect()

    if res do
      {user, url} =
        case scope do
          :member ->
            users = Repo.all(from u in Settings.Member, where: u.email == ^params["username"])

            user = List.first(users)
            {user, "/member/dashboard"}

          :user ->
            users = Repo.all(from u in Settings.User, where: u.username == ^params["username"])

            user = List.first(users)
            {user, "/admin/dashboard"}
        end

      token =
        Phoenix.Token.sign(
          CacWeb.Endpoint,
          "signature",
          BluePotion.s_to_map(user) |> Map.take([:id, :name])
        )

      # {user, token}

      conn
      |> put_session(:current_user, BluePotion.s_to_map(user))
      |> put_session(:user_token, token)
      |> put_flash(:info, "Welcome!")
      |> redirect(to: url)
    else
      if scope == :user do
        conn
        |> put_flash(:info, "Denied!")
        |> redirect(to: "/admin/login")
      else
        conn
        |> put_flash(:info, "Denied!")
        |> redirect(to: "/member/login")
      end
    end
  end

  def logout(conn, params) do
    url =
      if "member" in conn.path_info do
        "/member/login"
      else
        "/admin/login"
      end

    conn
    |> delete_session(:current_user)
    |> put_flash(:info, "Logout!")
    |> redirect(to: url)
  end

  def check_password(params, user \\ :user) do
    # your auth method here

    if user == :member do
      users = Repo.all(from u in Settings.Member, where: u.email == ^params["username"])

      if users != [] do
        user = List.first(users)

        crypted_password =
          :crypto.hash(:sha512, params["password"]) |> Base.encode16() |> String.downcase()

        # need a reset password page?
        crypted_password == user.crypted_password
      else
        false
      end
    else
      users = Repo.all(from u in Settings.User, where: u.username == ^params["username"])

      if users != [] do
        user = List.first(users)

        crypted_password =
          :crypto.hash(:sha512, params["password"]) |> Base.encode16() |> String.downcase()

        crypted_password == user.crypted_password
      else
        false
      end
    end

    # sample reference
  end
end
