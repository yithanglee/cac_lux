defmodule Cac.Settings.Region do
  use Ecto.Schema
  import Ecto.Changeset

  schema "regions" do
    field :alias, :string
    field :desc, :string
    field :name, :string
    field :user_id, :integer
    field :sort_no, :integer
    has_many :venues, Cac.Settings.Venue
    timestamps()
  end

  @doc false
  def changeset(region, attrs) do
    region
    |> cast(attrs, [:sort_no, :user_id, :alias, :name, :desc])

    # |> validate_required([:alias, :name, :desc])
  end
end
