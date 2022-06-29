defmodule Lux.Repo.Migrations.CreateAuthors do
  use Ecto.Migration

  def change do
    create table(:authors) do
      add :name, :string
      add :bio, :string
      add :img_url, :string

      timestamps()
    end

  end
end
