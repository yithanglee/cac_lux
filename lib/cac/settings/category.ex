defmodule Cac.Settings.Category do
  use Ecto.Schema
  import Ecto.Changeset

  schema "categories" do
    field :content, :binary
    field :desc, :string
    field :img_url, :string
    field :name, :string
    field :alias, :string
    field :sort_no, :integer
    field :show_menu, :boolean, default: true
    # field :parent_id, :integer
    belongs_to :parent, Cac.Settings.Category, foreign_key: :parent_id
    has_many :children, Cac.Settings.Category, foreign_key: :parent_id, references: :id

    # has_many(:stock_adjustments, Hub.Schema.StockAdjustment,
    #   foreign_key: :external_id,
    #   references: :external_id
    # )
    timestamps()
  end

  @doc false
  def changeset(category, attrs) do
    category
    |> cast(attrs, [:show_menu, :alias, :sort_no, :parent_id, :name, :desc, :content, :img_url])

    # |> validate_required([:name, :desc, :content, :img_url])
  end
end
