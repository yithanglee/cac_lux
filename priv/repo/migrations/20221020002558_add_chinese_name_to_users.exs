defmodule Cac.Repo.Migrations.AddChineseNameToUsers do
  use Ecto.Migration

  def change do
    alter table("users") do
      add :chinese_name, :string 
    end
  end
end
