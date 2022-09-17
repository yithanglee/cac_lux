defmodule Cac.Settings.Category do
  use Ecto.Schema
  import Ecto.Changeset

  schema "categories" do
    field :content, :binary
    field :desc, :string
    field :img_url, :string
    field :name, :string
    # field :parent_id, :integer
    belongs_to :parent, Cac.Settings.Category, foreign_key: :parent_id
    timestamps()
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> cast(attrs, [:parent_id, :name, :desc, :content, :img_url])

    # |> validate_required([:name, :desc, :content, :img_url])
  end
end
