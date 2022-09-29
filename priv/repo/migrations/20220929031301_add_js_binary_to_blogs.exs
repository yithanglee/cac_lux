defmodule Cac.Repo.Migrations.AddJsBinaryToBlogs do
  use Ecto.Migration

  def change do
    alter table ("blogs") do 
        add :javascript_binary, :binary 
        add :thumbnail_img, :string
    end 
  end
end
