defmodule Cac.Repo.Migrations.AddRemarksToUserGroups do
  use Ecto.Migration

  def change do
    alter table("user_groups") do 
      add :remarks, :string 
    end 
  end
end
