defmodule Cac.Settings.Blog do
  use Ecto.Schema
  import Ecto.Changeset
  import EctoEnum

  defenum(
    BlogType,
    ~w(
      blog page
    )
  )

  schema "blogs" do
    belongs_to :author, Cac.Settings.Author
    # field :author_id, :integer
    # field :category_id, :integer
    belongs_to :category, Cac.Settings.Category

    field :blog_type, BlogType, default: "blog"
    field :content, :binary
    field :excerpt, :binary
    field :img_url, :string
    field :subtitle, :string
    field :title, :string

    field :javascript_binary, :binary
    field :thumbnail_img, :string
    timestamps()
  end

  @doc false
  def changeset(blog, attrs) do
    blog
    |> cast(attrs, [
      :blog_type,
      :javascript_binary,
      :thumbnail_img,
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
