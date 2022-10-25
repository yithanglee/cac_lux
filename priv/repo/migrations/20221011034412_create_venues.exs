defmodule Cac.Repo.Migrations.CreateVenues do
  use Ecto.Migration

  def change do
    create table(:venues) do
      add :long, :float
      add :lat, :float
      add :name, :string
      add :address, :string
      add :phone, :string
      add :email, :string
      add :desc, :binary
      add :img_url, :string
      add :venue_type, :string
      add :region_id, :integer

      timestamps()
    end

  end
end
