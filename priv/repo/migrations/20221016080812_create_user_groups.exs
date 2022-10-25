defmodule Cac.Repo.Migrations.CreateUserGroups do
  use Ecto.Migration

  def change do
    create table(:user_groups) do
      add :user_id, :integer
      add :group_id, :integer
    end

  end
end
