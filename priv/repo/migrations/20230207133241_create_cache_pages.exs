defmodule Cac.Repo.Migrations.CreateCachePages do
  use Ecto.Migration

  def change do
    create table(:cache_pages) do
      add :title, :string
      add :content, :binary
      add :blog_id, :integer

      timestamps()
    end

  end
end
