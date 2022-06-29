defmodule Lux.Repo.Migrations.CreateCategories do
  use Ecto.Migration

  def change do
    create table(:categories) do
      add :name, :string
      add :desc, :string
      add :content, :binary
      add :img_url, :string

      timestamps()
    end

  end
end
