defmodule Cac.Settings.SubDepartment do
  use Ecto.Schema
  import Ecto.Changeset

  schema "sub_departments" do
    # field :blog_id, :integer
    belongs_to :blog, Cac.Settings.Blog
    belongs_to :department, Cac.Settings.Department
    field :cname, :string
    # field :department_id, :integer
    field :desc, :string
    field :icon, :string
    field :img_url, :string
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(sub_department, attrs) do
    sub_department
    |> cast(attrs, [:name, :cname, :desc, :img_url, :icon, :blog_id, :department_id])

    # |> validate_required([:name, :cname, :desc, :img_url, :icon, :blog_id, :department_id])
  end
end
