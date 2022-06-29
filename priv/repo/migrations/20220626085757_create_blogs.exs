defmodule Lux.Repo.Migrations.CreateBlogs do
  use Ecto.Migration

  def change do
    create table(:blogs) do
      add :title, :string
      add :subtitle, :string
      add :excerpt, :binary
      add :y, :string
      add :content, :binary
      add :author_id, :integer
      add :category_id, :integer
      add :img_url, :string

      timestamps()
    end

  end
end
