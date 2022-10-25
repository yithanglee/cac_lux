defmodule Cac.Settings.Venue do
  use Ecto.Schema
  import Ecto.Changeset
  import EctoEnum

  defenum(
    VenueEnum,
    ~w(
     Church
     Chapel
     Recreation
     Park
    )
  )

  schema "venues" do
    field :website, :string
    field :fb, :string
    field :youtube, :string
    field :blog, :string

    field :address, :string
    field :desc, :binary
    field :email, :string
    field :img_url, :string
    field :lat, :float
    field :long, :float
    field :name, :string
    field :phone, :string
    field :reg_no, :string
    belongs_to :region, Cac.Settings.Region
    field :sort_no, :integer
    has_many :user_venues, Cac.Settings.UserVenue
    has_many :users, through: [:user_venues, :user]
    # field :region_id, :integer
    field :venue_type, :string, default: :Church

    timestamps()
  end

  @doc false
  def changeset(venue, attrs) do
    venue
    |> cast(attrs, [
      :sort_no,
      # :fax,
      :website,
      :fb,
      :youtube,
      :blog,
      :reg_no,
      :long,
      :lat,
      :name,
      :address,
      :phone,
      :email,
      :desc,
      :img_url,
      :venue_type,
      :region_id
    ])

    # |> validate_required([:long, :lat, :name, :address, :phone, :email, :desc, :img_url, :venue_type, :region_id])
  end
end
