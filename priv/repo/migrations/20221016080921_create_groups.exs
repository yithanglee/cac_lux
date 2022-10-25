defmodule Cac.Repo.Migrations.CreateGroups do
  use Ecto.Migration

  def change do
    create table(:groups) do
      add :name, :string
      add :alias, :string
      add :desc, :string

      timestamps()
    end

  end
end
