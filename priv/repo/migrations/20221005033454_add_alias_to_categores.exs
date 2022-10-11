defmodule Cac.Repo.Migrations.AddAliasToCategores do
  use Ecto.Migration

  def change do
    alter table("categories") do 
        add :alias, :string
        add :sort_no, :integer
        add :show_menu, :boolean, default: true
    end 

    alter table("departments") do
      add :blog_id, :integer
    end
  end
end
