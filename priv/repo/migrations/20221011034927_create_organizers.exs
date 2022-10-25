defmodule Cac.Repo.Migrations.CreateOrganizers do
  use Ecto.Migration

  def change do
    create table(:organizers) do
      add :name, :string
      add :desc, :binary
      add :img_url, :string

      timestamps()
    end

  end
end
