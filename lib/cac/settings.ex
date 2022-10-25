defmodule Cac.Settings do
  @moduledoc """
  The Settings context.
  """

  import Ecto.Query, warn: false
  alias Ecto.Multi
  alias Cac.Repo

  def token(id) do
    Phoenix.Token.sign(
      CacWeb.Endpoint,
      "signature",
      %{id: id}
    )
  end

  def decode_token(token) do
    case Phoenix.Token.verify(CacWeb.Endpoint, "signature", token) do
      {:ok, map} ->
        map

      {:error, _reason} ->
        nil
    end
  end

  def verify_token(token, id) do
    {:ok, map} = Phoenix.Token.verify(CacWeb.Endpoint, "signature", token)
    map.id == id
  end

  alias Cac.Settings.Group

  def list_groups(_params) do
    Repo.all(Group)
  end

  def get_group!(id) do
    Repo.get!(Group, id)
  end

  def create_group(params \\ %{}) do
    Group.changeset(%Group{}, params) |> Repo.insert()
  end

  def update_group(model, params) do
    Group.changeset(model, params) |> Repo.update()
  end

  def delete_group(%Group{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.Role

  def list_roles() do
    Repo.all(Role)
  end

  def get_role!(id) do
    Repo.get!(Role, id)
  end

  def create_role(params \\ %{}) do
    Role.changeset(%Role{}, params) |> Repo.insert()
  end

  def update_role(model, params) do
    Role.changeset(model, params) |> Repo.update()
  end

  def delete_role(%Role{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.User

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

  <script>PDFObject.embed("/pdf/sample-3pp.pdf", "#example1");</script>
  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  alias Cac.Settings.UserGroup

  def list_user_groups() do
    Repo.all(UserGroup)
  end

  def get_user_group!(id) do
    Repo.get!(UserGroup, id)
  end

  def create_user_group(params \\ %{}) do
    UserGroup.changeset(%UserGroup{}, params) |> Repo.insert()
  end

  def update_user_group(model, params) do
    UserGroup.changeset(model, params) |> Repo.update()
  end

  def delete_user_group(%UserGroup{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.Blog

  def list_blogs(opts \\ nil, limit \\ 10) do
    category_name = opts |> Map.get("category", nil)

    is_page = opts |> Map.get("is_page", false)

    blog_type =
      case is_page do
        "false" ->
          "blog"

        "true" ->
          "page"

        _ ->
          "blog"
      end

    q =
      if category_name != nil do
        from b in Blog,
          left_join: c in Cac.Settings.Category,
          on: c.id == b.category_id,
          left_join: cc in Cac.Settings.Category,
          on: cc.id == c.parent_id,
          where: cc.name == ^category_name,
          or_where: c.name == ^category_name,
          preload: [:category, :author],
          limit: 10,
          order_by: [desc: b.inserted_at]
      else
        from b in Blog, preload: [:category, :author], limit: 10, order_by: [desc: b.inserted_at]
      end
      |> where([b], b.blog_type == ^"#{blog_type}")

    Repo.all(q)
  end

  def get_blog!(id) do
    Repo.get!(Blog, id) |> Repo.preload([:attachment, :category, :author])
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

  alias Cac.Settings.Author

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

  alias Cac.Settings.Category

  def list_categories() do
    Repo.all(from c in Category, preload: [:parent])
  end

  def get_category!(id) do
    Repo.get!(Category, id)
  end

  def create_category(params \\ %{}) do
    Category.changeset(%Category{}, params) |> Repo.insert()
  end

  def get_category_by_name(name) do
    res = Repo.get_by(Category, name: name)

    if res != nil do
      res
    else
      {:ok, cat} = create_category(%{name: name})
      cat
    end
  end

  def update_category(model, params) do
    Category.changeset(model, params) |> Repo.update()
  end

  def delete_category(%Category{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.StoredMedia

  def list_stored_medias() do
    Repo.all(StoredMedia)
  end

  def get_stored_media!(id) do
    Repo.get!(StoredMedia, id)
  end

  def create_stored_media(params \\ %{}) do
    a = StoredMedia.changeset(%StoredMedia{}, params) |> Repo.insert()

    case a do
      {:ok, sm} ->
        filename = sm.img_url |> String.replace("/images/uploads/", "")
        Cac.s3_large_upload(filename)

        StoredMedia.changeset(sm, %{
          s3_url: "https://cac-bucket.ap-south-1.linodeobjects.com/#{filename}"
        })
        |> Repo.update()

      _ ->
        nil
    end

    a
  end

  def update_stored_media(model, params) do
    StoredMedia.changeset(model, params) |> Repo.update()
  end

  def delete_stored_media(%StoredMedia{} = model) do
    Repo.delete(model)
  end

  def get_category_children(parent_id) do
    Repo.all(from c in Category, where: c.parent_id == ^parent_id)
    |> Enum.map(&(&1 |> BluePotion.s_to_map()))
  end

  def update_category_children(parent_id, children_ids) do
    for children_id <- children_ids do
      c = Repo.get(Category, children_id)
      update_category(c, %{parent_id: parent_id})
    end
  end

  def get_blog_between(startDt, endDt) do
  end

  alias Cac.Settings.Department

  def list_departments() do
    Repo.all(from d in Department, preload: [sub_departments: :blog])
  end

  def get_department!(id) do
    Repo.get!(Department, id)
  end

  def create_department(params \\ %{}) do
    Department.changeset(%Department{}, params) |> Repo.insert()
  end

  def update_department(model, params) do
    Department.changeset(model, params) |> Repo.update()
  end

  def delete_department(%Department{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.SubDepartment

  def list_sub_departments() do
    Repo.all(SubDepartment)
  end

  def get_sub_department!(id) do
    Repo.get!(SubDepartment, id)
  end

  def create_sub_department(params \\ %{}) do
    SubDepartment.changeset(%SubDepartment{}, params) |> Repo.insert()
  end

  def update_sub_department(model, params) do
    SubDepartment.changeset(model, params) |> Repo.update()
  end

  def delete_sub_department(%SubDepartment{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.Organizer

  def list_organizers() do
    Repo.all(Organizer)
  end

  def get_organizer!(id) do
    Repo.get!(Organizer, id)
  end

  def create_organizer(params \\ %{}) do
    Organizer.changeset(%Organizer{}, params) |> Repo.insert()
  end

  def update_organizer(model, params) do
    Organizer.changeset(model, params) |> Repo.update()
  end

  def delete_organizer(%Organizer{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.Speaker

  def list_speakers() do
    Repo.all(Speaker)
  end

  def get_speaker!(id) do
    Repo.get!(Speaker, id)
  end

  def create_speaker(params \\ %{}) do
    Speaker.changeset(%Speaker{}, params) |> Repo.insert()
  end

  def update_speaker(model, params) do
    Speaker.changeset(model, params) |> Repo.update()
  end

  def delete_speaker(%Speaker{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.Event

  def list_events() do
    Repo.all(Event)
  end

  def get_event!(id) do
    Repo.get!(Event, id)
  end

  def create_event(params \\ %{}) do
    Event.changeset(%Event{}, params) |> Repo.insert()
  end

  def update_event(model, params) do
    Event.changeset(model, params) |> Repo.update()
  end

  def delete_event(%Event{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.Venue

  def list_venues() do
    Repo.all(Venue)
  end

  def get_venue!(id) do
    Repo.get!(Venue, id)
  end

  def create_venue(params \\ %{}) do
    Venue.changeset(%Venue{}, params) |> Repo.insert()
  end

  def update_venue(model, params) do
    Venue.changeset(model, params) |> Repo.update()
  end

  def delete_venue(%Venue{} = model) do
    Repo.delete(model)
  end

  alias Cac.Settings.Region

  def list_regions() do
    Repo.all(Region)
  end

  def get_region!(id) do
    Repo.get!(Region, id)
  end

  def create_region(params \\ %{}) do
    Region.changeset(%Region{}, params) |> Repo.insert()
  end

  def update_region(model, params) do
    Region.changeset(model, params) |> Repo.update()
  end

  def delete_region(%Region{} = model) do
    Repo.delete(model)
  end

  def assign_event_speaker(parent, children_ids) do
    Repo.delete_all(from es in Cac.Settings.EventSpeaker, where: es.event_id == ^parent)

    for id <- children_ids do
      Cac.Settings.EventSpeaker.changeset(%Cac.Settings.EventSpeaker{}, %{
        event_id: parent,
        speaker_id: id
      })
      |> Repo.insert()
    end
  end

  def assign_group_user(parent, children_ids, params) do
    Repo.delete_all(from ug in Cac.Settings.UserGroup, where: ug.group_id == ^parent)

    for id <- children_ids do
      Cac.Settings.UserGroup.changeset(%Cac.Settings.UserGroup{}, %{
        group_id: parent,
        user_id: id,
        remarks: params |> Kernel.get_in(["remarks", id])
      })
      |> Repo.insert()
    end
  end

  def assign_venue_user(parent, children_ids, params) do
    Repo.delete_all(from ug in Cac.Settings.UserVenue, where: ug.venue_id == ^parent)

    for id <- children_ids do
      Cac.Settings.UserVenue.changeset(%Cac.Settings.UserVenue{}, %{
        venue_id: parent,
        user_id: id,
        remarks: params |> Kernel.get_in(["remarks", id]),
        date_start: params |> Kernel.get_in(["start_date", id])
      })
      |> Repo.insert()
    end
  end

  def get_group_users(group_id) do
    q =
      from ug in UserGroup,
        left_join: u in User,
        on: u.id == ug.user_id,
        where: ug.group_id == ^group_id,
        preload: [user: [:venues]]

    Repo.all(q) |> IO.inspect()
  end

  alias Cac.Settings.UserVenue

  def list_user_venues() do
    Repo.all(UserVenue)
  end

  def get_user_venue!(id) do
    Repo.get!(UserVenue, id)
  end

  def create_user_venue(params \\ %{}) do
    UserVenue.changeset(%UserVenue{}, params) |> Repo.insert()
  end

  def delete_user_venue(params \\ %{}) do
    Repo.delete_all(
      from uv in UserVenue,
        where:
          uv.user_id == ^params["user_id"] and uv.venue_id == ^params["venue_id"] and
            uv.remarks == ^params["remarks"]
    )
  end

  def update_user_venue(model, params) do
    UserVenue.changeset(model, params) |> Repo.update()
  end

  def delete_user_venue(%UserVenue{} = model) do
    Repo.delete(model)
  end

  def get_venue_users(venue_id) do
    q =
      from ug in UserVenue,
        left_join: u in User,
        on: u.id == ug.user_id,
        where: ug.venue_id == ^venue_id,
        preload: [:user]

    Repo.all(q)
  end
end
