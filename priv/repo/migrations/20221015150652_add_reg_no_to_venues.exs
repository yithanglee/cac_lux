defmodule Cac.Repo.Migrations.AddRegNoToVenues do
  use Ecto.Migration

  def change do
    alter table("venues") do
      add :reg_no, :string 
    end
  end
end
