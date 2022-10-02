defmodule Cac.Repo.Migrations.CreateDepartments do
  use Ecto.Migration

  def change do
    create table(:departments) do
      add :name, :string
      add :desc, :string
      add :long_desc, :binary
      add :img_url, :string
      add :iconn, :string

      timestamps()
    end

  end
end
