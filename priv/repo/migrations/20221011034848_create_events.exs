defmodule Cac.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events) do
      add :start_datetime, :naive_datetime
      add :end_datetime, :naive_datetime
      add :title, :string
      add :description, :binary
      add :subtitle, :string
      add :venue_id, :integer
      add :organizer_id, :integer

      timestamps()
    end

  end
end
