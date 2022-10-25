defmodule Cac.Repo.Migrations.CreateRegions do
  use Ecto.Migration

  def change do
    create table(:regions) do
      add :alias, :string
      add :name, :string
      add :desc, :string

      timestamps()
    end

  end
end
