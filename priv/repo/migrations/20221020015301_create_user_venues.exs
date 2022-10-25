defmodule Cac.Repo.Migrations.CreateUserVenues do
  use Ecto.Migration

  def change do
    create table(:user_venues) do
      add :user_id, :integer
      add :venue_id, :integer
      add :remarks, :string
      add :date_start, :date
      add :date_end, :date

      timestamps()
    end

  end
end
