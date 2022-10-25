defmodule Cac.Settings.Speaker do
  use Ecto.Schema
  import Ecto.Changeset

  schema "speakers" do
    field :bio, :binary
    field :contact_email, :string
    field :contact_html, :binary
    field :contact_phone, :string
    field :img_url, :string
    field :name, :string
    field :title, :string

    timestamps()
  end

  @doc false
  def changeset(speaker, attrs) do
    speaker
    |> cast(attrs, [:name, :title, :bio, :img_url, :contact_html, :contact_phone, :contact_email])

    # |> validate_required([:name, :title, :bio, :img_url, :contact_html, :contact_phone, :contact_email])
  end
end
