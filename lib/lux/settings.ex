defmodule Lux.Settings do
  @moduledoc """
  The Settings context.
  """

  import Ecto.Query, warn: false
  alias Ecto.Multi
  alias Lux.Repo

  def token(id) do
    Phoenix.Token.sign(
      LuxWeb.Endpoint,
      "signature",
      %{id: id}
    )
  end

  def decode_token(token) do
    case Phoenix.Token.verify(LuxWeb.Endpoint, "signature", token) do
      {:ok, map} ->
        map

      {:error, _reason} ->
        nil
    end
  end

  def verify_token(token, id) do
    {:ok, map} = Phoenix.Token.verify(LuxWeb.Endpoint, "signature", token)
    map.id == id
  end

  alias Lux.Settings.User

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  def get_user_by_fb_user_id(id) do
    Repo.get_by(User, fb_user_id: id) |> Repo.preload(:facebook_pages)
  end

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  alias Lux.Settings.Blog

  def list_blogs(limit \\ 10) do
    Repo.all(from b in Blog, preload: [:category, :author], limit: 10, order_by: [desc: b.id])
  end

  def get_blog!(id) do
    Repo.get!(Blog, id)
  end

  def create_blog(params \\ %{}) do
    Blog.changeset(%Blog{}, params) |> Repo.insert()
  end

  def update_blog(model, params) do
    Blog.changeset(model, params) |> Repo.update()
  end

  def delete_blog(%Blog{} = model) do
    Repo.delete(model)
  end

  alias Lux.Settings.Author

  def list_authors() do
    Repo.all(Author)
  end

  def get_author!(id) do
    Repo.get!(Author, id)
  end

  def create_author(params \\ %{}) do
    Author.changeset(%Author{}, params) |> Repo.insert()
  end

  def update_author(model, params) do
    Author.changeset(model, params) |> Repo.update()
  end

  def delete_author(%Author{} = model) do
    Repo.delete(model)
  end

  alias Lux.Settings.Category

  def list_categories() do
    Repo.all(Category)
  end

  def get_category!(id) do
    Repo.get!(Category, id)
  end

  def create_category(params \\ %{}) do
    Category.changeset(%Category{}, params) |> Repo.insert()
  end

  def update_category(model, params) do
    Category.changeset(model, params) |> Repo.update()
  end

  def delete_category(%Category{} = model) do
    Repo.delete(model)
  end
end
