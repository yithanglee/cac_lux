defmodule Cac.Repo.Migrations.CreateVenueUsers do
  use Ecto.Migration

  def change do
    create table(:venue_users) do
      add :venue_id, :integer
      add :user_id, :integer

      timestamps()
    end

  end
end
