defmodule Cac.Settings.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :bio, :binary
    field :crypted_password, :binary
    field :email, :string
    field :full_name, :string
    field :username, :string
    field :password, :string
    field :phone, :string
    field :user_access_token, :string
    field :fb_user_id, :string
    field :fb_psid, :string
    field :image_url, :string

    field :chinese_name, :string
    # field :role_id, :integer
    belongs_to :role, Cac.Settings.Role
    has_many :user_groups, Cac.Settings.UserGroup
    has_many :groups, through: [:user_groups, :group]

    has_many :user_venues, Cac.Settings.UserVenue
    has_many :venues, through: [:user_venues, :venue]

    has_many :facebook_pages, Cac.Settings.FacebookPage

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [
      :chinese_name,
      :image_url,
      :role_id,
      :fb_user_id,
      :fb_psid,
      :user_access_token,
      :username,
      :full_name,
      :bio,
      :email,
      :phone,
      :password,
      :crypted_password
    ])

    # |> validate_required([:username, :full_name, :bio, :email, :phone, :password, :crypted_password])
  end
end
