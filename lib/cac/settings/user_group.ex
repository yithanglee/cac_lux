defmodule Cac.Settings.UserGroup do
  use Ecto.Schema
  import Ecto.Changeset

  schema "user_groups" do
    # field :user_id, :integer
    field :sort_no, :integer
    field :remarks, :string
    belongs_to :user, Cac.Settings.User
    belongs_to :group, Cac.Settings.Group
  end

  @doc false
  def changeset(user_group, attrs) do
    user_group
    |> cast(attrs, [:remarks, :sort_no, :user_id, :group_id])
  end
end
