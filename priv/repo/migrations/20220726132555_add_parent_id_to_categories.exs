defmodule Lux.Repo.Migrations.AddParentIdToCategories do
  use Ecto.Migration

  def change do
    alter table("categories") do
      add :parent_id, :integer
    end
  end
end
