defmodule Lux.Settings.Category do
  use Ecto.Schema
  import Ecto.Changeset

  schema "categories" do
    field :content, :binary
    field :desc, :string
    field :img_url, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> cast(attrs, [:name, :desc, :content, :img_url])

    # |> validate_required([:name, :desc, :content, :img_url])
  end
end
