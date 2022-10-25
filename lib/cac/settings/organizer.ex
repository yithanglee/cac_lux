defmodule Cac.Settings.Organizer do
  use Ecto.Schema
  import Ecto.Changeset

  schema "organizers" do
    field :desc, :binary
    field :img_url, :string
    field :name, :string

    field :contact_html, :binary
    field :contact_phone, :string
    field :contact_email, :string
    timestamps()
  end

  @doc false
  def changeset(organizer, attrs) do
    organizer
    |> cast(attrs, [:contact_html, :contact_email, :contact_phone, :name, :desc, :img_url])

    # |> validate_required([:name, :desc, :img_url])
  end
end
