defmodule Cac.Settings.CachePage do
  use Ecto.Schema
  import Ecto.Changeset

  schema "cache_pages" do
    # field :blog_id, :integer
    belongs_to :blog, Cac.Settings.Blog
    field :content, :binary
    field :title, :string

    timestamps()
  end

  @doc false
  def changeset(cache_page, attrs) do
    cache_page
    |> cast(attrs, [:title, :content, :blog_id])
    |> validate_required([:content, :blog_id])
  end
end
