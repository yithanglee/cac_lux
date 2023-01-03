defmodule Cac.Settings.Member do
  use Ecto.Schema
  import Ecto.Changeset

  schema "members" do
    field :uid, :string
    field :area, :string
    field :code, :string
    field :cname, :string
    field :crypted_password, :string
    field :password, :string, virtual: true
    field :email, :string
    field :image_url, :string
    field :line1, :string
    field :line2, :string
    field :name, :string
    field :phone, :string
    field :postcode, :string
    # field :venue_id, :integer
    belongs_to :venue, Cac.Settings.Venue

    timestamps()
  end

  @doc false
  def changeset(member, attrs) do
    member
    |> cast(attrs, [
      :code,
      :uid,
      :name,
      :cname,
      :email,
      :phone,
      :line1,
      :line2,
      :area,
      :postcode,
      :venue_id,
      :image_url,
      :crypted_password
    ])
    |> validate_required([
      :name,
      # :cname,
      :email
      # :phone,
      # :line1,
      # :line2,
      # :area,
      # :postcode,
      # :venue_id,
      # :image_url,
      # :crypted_password
    ])
  end
end
