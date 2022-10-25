defmodule Cac.Settings.Role do
  use Ecto.Schema
  import Ecto.Changeset

  schema "roles" do
    field :alias, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(role, attrs) do
    role
    |> cast(attrs, [:name, :alias])
    |> validate_required([:name, :alias])
  end
end
