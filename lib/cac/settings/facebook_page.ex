defmodule Cac.Settings.FacebookPage do
  use Ecto.Schema
  import Ecto.Changeset

  schema "facebook_pages" do
    field :name, :string
    field :page_access_token, :binary
    field :page_id, :string
    field :user_id, :integer

    timestamps()
  end

  @doc false
  def changeset(facebook_page, attrs) do
    facebook_page
    |> cast(attrs, [:user_id, :page_id, :name, :page_access_token])
    |> validate_required([:user_id, :page_id, :name, :page_access_token])
  end
end
