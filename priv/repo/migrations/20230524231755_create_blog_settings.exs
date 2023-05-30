defmodule Cac.Repo.Migrations.CreateBlogSettings do
  use Ecto.Migration

  def change do
    create table(:blog_settings) do
      add :key, :string
      add :cvalue, :string
      add :nvalue, :integer
      add :group, :string

      timestamps()
    end

  end
end
