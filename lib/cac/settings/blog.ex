defmodule Cac.Settings.Blog do
  use Ecto.Schema
  import Ecto.Changeset

  schema "blogs" do
    belongs_to :author, Cac.Settings.Author
    # field :author_id, :integer
    # field :category_id, :integer
    belongs_to :category, Cac.Settings.Category
    field :content, :binary
    field :excerpt, :binary
    field :img_url, :string
    field :subtitle, :string
    field :title, :string

    timestamps()
  end

  @doc false
  def changeset(blog, attrs) do
    blog
    |> cast(attrs, [
      :inserted_at,
      :updated_at,
      :title,
      :subtitle,
      :excerpt,
      :content,
      :author_id,
      :category_id,
      :img_url
    ])

    # |> validate_required([
    #   :title,
    #   :subtitle,
    #   :excerpt,
    #   :content,
    #   :author_id,
    #   :category_id,
    #   :img_url
    # ])
  end
end