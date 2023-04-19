defmodule Cac.Repo.Migrations.AddSearchKeyword do
  use Ecto.Migration

  def change do
    alter table("venues") do
      add :search_keyword, :string 
    end
    alter table("blogs") do
      add :meta_keywords, :string
      add :meta_description, :string 
    end

  end
end
