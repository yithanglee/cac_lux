defmodule Cac.Repo.Migrations.AddServiceYearsToUserGroupsUserVenues do
  use Ecto.Migration

  def change do
    alter table("user_groups") do
      add :service_year_id, :integer
    end
    alter table("user_venues") do
      add :service_year_id, :integer
    end
  end
end
