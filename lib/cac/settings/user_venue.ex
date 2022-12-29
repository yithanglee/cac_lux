defmodule Cac.Settings.UserVenue do
  use Ecto.Schema
  import Ecto.Changeset

  schema "user_venues" do
    field :date_end, :date
    field :date_start, :date
    field :remarks, :string
    # field :user_id, :integer
    # field :venue_id, :integer
    belongs_to :user, Cac.Settings.User
    belongs_to :venue, Cac.Settings.Venue

    belongs_to :service_year, Cac.Settings.ServiceYear
    timestamps()
  end

  @doc false
  def changeset(user_venue, attrs) do
    user_venue
    |> cast(attrs, [:user_id, :venue_id, :remarks, :date_start, :date_end, :service_year_id])

    # |> validate_required([:user_id, :venue_id, :remarks, :date_start, :date_end])
  end
end
