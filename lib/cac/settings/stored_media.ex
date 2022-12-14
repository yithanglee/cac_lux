defmodule Cac.Settings.StoredMedia do
  use Ecto.Schema
  import Ecto.Changeset
  import EctoEnum

  defenum(
    MediaEnum,
    ~w(
     image
     pdf
    )
  )

  schema "stored_medias" do
    field :f_extension, :string
    field :f_type, MediaEnum, default: :image
    field :name, :string
    field :s3_url, :binary
    field :size, :integer
    field :img_url, :string, virtual: true
    timestamps()
  end

  @doc false
  def changeset(stored_media, attrs) do
    stored_media
    |> cast(attrs, [:img_url, :name, :s3_url, :size, :f_type, :f_extension])

    # |> validate_required([:name, :s3_url, :size, :f_type, :f_extension])
  end
end
