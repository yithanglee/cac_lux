defmodule Cac.Settings.BlogSetting do
  use Ecto.Schema
  import Ecto.Changeset

  schema "blog_settings" do
    field :cvalue, :string
    field :group, :string
    field :key, :string
    field :nvalue, :integer

    timestamps()
  end

  @doc false
  def changeset(blog_setting, attrs) do
    blog_setting
    |> cast(attrs, [:key, :cvalue, :nvalue, :group])

    # |> validate_required([:key, :cvalue, :nvalue, :group])
  end
end
