defmodule Cac.Repo.Migrations.AddPostTypeToBlogs do
  use Ecto.Migration

  def change do
    alter table("blogs") do
      add :blog_type, :string, default: "blog"
    end
  end
end
