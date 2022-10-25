defmodule Cac.Settings.EventSpeaker do
  use Ecto.Schema
  import Ecto.Changeset

  schema "event_speakers" do
    belongs_to :event, Cac.Settings.Event
    belongs_to :speaker, Cac.Settings.Speaker
    # field :event_id, :integer
    # field :speaker_id, :integer
  end

  @doc false
  def changeset(event_speaker, attrs) do
    event_speaker
    |> cast(attrs, [:event_id, :speaker_id])
    |> validate_required([:event_id, :speaker_id])
  end
end
