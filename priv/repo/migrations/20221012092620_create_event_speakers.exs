defmodule Cac.Repo.Migrations.CreateEventSpeakers do
  use Ecto.Migration

  def change do
    create table(:event_speakers) do
      add :event_id,  references(:events)
      add :speaker_id,  references(:speakers)

    end

  end
end
