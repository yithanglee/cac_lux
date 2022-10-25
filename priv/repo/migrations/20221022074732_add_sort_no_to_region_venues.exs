defmodule Cac.Repo.Migrations.AddSortNoToRegionVenues do
  use Ecto.Migration

  def change do
    alter table("regions") do
      add :sort_no, :integer
    end
    alter table("venues") do
      add :sort_no, :integer
    end

  end
end
