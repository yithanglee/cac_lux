defmodule Cac.Settings.Event do
  use Ecto.Schema
  import Ecto.Changeset

  schema "events" do
    field :description, :binary
    field :end_datetime, :naive_datetime
    # field :organizer_id, :integer
    belongs_to :organizer, Cac.Settings.Organizer
    field :start_datetime, :naive_datetime
    field :subtitle, :string
    field :title, :string
    field :img_url, :string
    # field :venue_id, :integer
    belongs_to :venue, Cac.Settings.Venue

    many_to_many :speakers, Cac.Settings.Speaker,
      join_through: "event_speakers",
      join_keys: [event_id: :id, speaker_id: :id],
      on_replace: :delete

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [
      :img_url,
      :start_datetime,
      :end_datetime,
      :title,
      :description,
      :subtitle,
      :venue_id,
      :organizer_id
    ])

    # |> validate_required([:start_datetime, :end_datetime, :title, :description, :subtitle, :venue_id, :organizer_id])
  end
end
