defmodule Cac.Settings.Department do
  use Ecto.Schema
  import Ecto.Changeset

  schema "departments" do
    field :desc, :string
    field :iconn, :string
    field :img_url, :string
    field :long_desc, :binary
    field :name, :string

    has_many :sub_departments, Cac.Settings.SubDepartment, foreign_key: :department_id
    timestamps()
  end

  @doc false
  def changeset(department, attrs) do
    department
    |> cast(attrs, [:name, :desc, :long_desc, :img_url, :iconn])

    # |> validate_required([:name, :desc, :long_desc, :img_url, :iconn])
  end
end
