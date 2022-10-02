defmodule Cac.Repo.Migrations.CreateSubDepartments do
  use Ecto.Migration

  def change do
    create table(:sub_departments) do
      add :name, :string
      add :cname, :string
      add :desc, :string
      add :img_url, :string
      add :icon, :string
      add :blog_id, :integer
      add :department_id, :integer

      timestamps()
    end

  end
end
