defmodule Cac.Settings.Group do
  use Ecto.Schema
  import Ecto.Changeset

  schema "groups" do
    field :alias, :string
    field :desc, :string
    field :name, :string

    field :sort_no, :integer, default: 0
    has_many :user_groups, Cac.Settings.UserGroup
    has_many :users, through: [:user_groups, :user]
    timestamps()
  end

  @doc false
  def changeset(group, attrs) do
    group
    |> cast(attrs, [:sort_no, :name, :alias, :desc])
    |> validate_required([:name, :alias, :desc])
  end
end
