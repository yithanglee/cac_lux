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
    has_one :cache_page, Cac.Settings.CachePage
    belongs_to :category, Cac.Settings.Category
    # field :attachment_id, :integer
    belongs_to :attachment, Cac.Settings.StoredMedia
    field :blog_type, BlogType, default: "blog"
    field :content, :binary
    field :excerpt, :binary
    field :img_url, :string
    field :subtitle, :string
    field :title, :string

    field :meta_keywords, :string
    field :meta_description, :string
    field :javascript_binary, :binary
    field :thumbnail_img, :string
    timestamps()
  end

  @doc false
  def changeset(blog, attrs) do
    blog
    |> cast(attrs, [
      :meta_keywords,
      :meta_description,
      :attachment_id,
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
