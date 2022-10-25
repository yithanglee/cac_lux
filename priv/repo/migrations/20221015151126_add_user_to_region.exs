defmodule Cac.Repo.Migrations.AddUserToRegion do
  use Ecto.Migration

  def change do
    alter table("regions") do
      add :user_id, :integer
    end
  end
end
