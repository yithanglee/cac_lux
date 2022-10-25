defmodule Cac.Settings.VenueUser do
  use Ecto.Schema
  import Ecto.Changeset

  schema "venue_users" do
    field :user_id, :integer
    field :venue_id, :integer

    timestamps()
  end

  @doc false
  def changeset(venue_user, attrs) do
    venue_user
    |> cast(attrs, [:venue_id, :user_id])
    |> validate_required([:venue_id, :user_id])
  end
end
