defmodule Cac.Repo.Migrations.AddSortNoGroups do
  use Ecto.Migration

  def change do
    alter table("groups") do
      add :sort_no, :integer, default: 0
    end


    alter table("user_groups") do
      add :sort_no, :integer, default: 0
    end


    
  end
end
